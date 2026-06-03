import {
  Component, signal, inject, OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodTrackerService } from '../services/food-tracker.service';
import { FoodCategory } from '../models/food-item.model';

export interface ProductResult {
  name: string; brand: string; cat: FoodCategory;
  qty: number; unit: string; expiry: string;
  ingredients: string; imageUrl: string;
  barcode: string; nutriScore: string; note: string;
}

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent implements OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  svc = inject(FoodTrackerService);

  mode          = signal<'choose'|'camera'|'manual'|'result'|'ocr'>('choose');
  cameraActive  = signal(false);
  cameraError   = signal('');
  scanStatus    = signal('Point camera at a barcode');
  detectedCode  = signal('');
  scanning      = signal(false);
  manualBarcode = signal('');
  ocrText        = signal('');
  voiceText      = signal('');
  voiceListening = signal(false);
  voiceError     = signal('');
  fetching      = signal(false);
  fetchError    = signal('');
  product       = signal<ProductResult | null>(null);
  formExpiry    = signal(this.svc.defaultExpiry());
  formNote      = signal('');
  added         = signal(false);
  toastMsg      = signal('');
  toastVisible  = signal(false);

  private stream: MediaStream | null = null;
  private animFrame: number = 0;
  private detector: any = null;
  private toastTimer: any;

  // ── Navigation ──────────────────────────────────────────────────
  goBack() {
    this.stopCamera();
    this.mode.set('choose');
    this.product.set(null);
    this.added.set(false);
    this.fetchError.set('');
    this.cameraError.set('');
    this.detectedCode.set('');
    this.manualBarcode.set('');
    this.scanning.set(false);
  }

  // ── Camera ───────────────────────────────────────────────────────
  async startCamera() {
    this.mode.set('camera');
    this.cameraError.set('');
    this.cameraActive.set(false);
    this.detectedCode.set('');
    this.scanStatus.set('Starting camera…');

    // Init BarcodeDetector (built into Chrome)
    try {
      const BD = (window as any).BarcodeDetector;
      if (BD) {
        this.detector = new BD({
          formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code','data_matrix','itf']
        });
      }
    } catch { this.detector = null; }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setTimeout(() => {
        const v = this.videoEl?.nativeElement;
        if (v) {
          v.srcObject = this.stream;
          v.play().then(() => {
            this.cameraActive.set(true);
            this.scanStatus.set('Point camera at a product barcode');
            this.scanLoop();
          });
        }
      }, 200);
    } catch (err: any) {
      this.cameraError.set(
        err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access in Chrome settings.' :
        err.name === 'NotFoundError'   ? 'No camera found on this device.' :
        'Camera error: ' + (err.message || err.name)
      );
    }
  }

  private async scanLoop() {
    if (!this.cameraActive() || this.scanning()) return;
    const v = this.videoEl?.nativeElement;
    if (!v || v.readyState < 2) {
      this.animFrame = requestAnimationFrame(() => this.scanLoop());
      return;
    }

    // Use BarcodeDetector API — fastest, built into Chrome
    if (this.detector) {
      try {
        const results = await this.detector.detect(v);
        if (results?.length > 0) {
          this.onCodeFound(results[0].rawValue);
          return;
        }
      } catch { /* continue */ }
    } else {
      // Fallback: canvas pixel scan for simple barcodes
      this.canvasScan(v);
    }

    this.animFrame = requestAnimationFrame(() => this.scanLoop());
  }

  private canvasScan(v: HTMLVideoElement) {
    const c = this.canvasEl?.nativeElement;
    if (!c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
  }

  private onCodeFound(code: string) {
    if (!code || this.scanning()) return;
    this.scanning.set(true);
    this.detectedCode.set(code);
    this.scanStatus.set(`✅ Detected: ${code}`);
    cancelAnimationFrame(this.animFrame);
    this.stopCamera();
    this.fetchProduct(code);
  }

  stopCamera() {
    cancelAnimationFrame(this.animFrame);
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.cameraActive.set(false);
  }

  // ── Manual ───────────────────────────────────────────────────────
  startManual() { this.mode.set('manual'); this.manualBarcode.set(''); this.fetchError.set(''); }

  lookupManual() {
    const code = this.manualBarcode().trim();
    if (!code) return;
    this.fetchProduct(code);
  }

  // ── OCR ──────────────────────────────────────────────────────────
  startOCR() { this.mode.set('ocr'); this.ocrText.set(''); }

  parseOCR() {
    const text = this.ocrText().trim();
    if (!text) return;
    const dateMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    let expiry = this.svc.defaultExpiry();
    if (dateMatch) {
      const [, d, m, y] = dateMatch;
      expiry = `${y.length===2?'20'+y:y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    const nameMatch = text.match(/(?:product|name|item)[:\s]+([A-Za-z\s]+)/i);
    this.product.set({ name: nameMatch?.[1]?.trim()||'OCR Scanned Item', brand:'', cat:'pantry', qty:1, unit:'pcs', expiry, ingredients:'', imageUrl:'', barcode:'', nutriScore:'', note:'' });
    this.formExpiry.set(expiry);
    this.mode.set('result');
  }

  // ── Open Food Facts API ───────────────────────────────────────────
  async fetchProduct(barcode: string) {
    this.fetching.set(true);
    this.fetchError.set('');
    this.mode.set('result');
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 0 || !data.product) {
        this.product.set({ name:'Unknown Product', brand:'', cat:'pantry', qty:1, unit:'pcs', expiry:this.svc.defaultExpiry(), ingredients:'', imageUrl:'', barcode, nutriScore:'', note:`Barcode: ${barcode}` });
        this.fetchError.set('Product not found in database. Please fill in details manually.');
      } else {
        const p = data.product;
        const expiry = this.parseExpiry(p.expiration_date||'');
        this.product.set({
          name:        p.product_name||p.product_name_en||'Unknown Product',
          brand:       p.brands||'',
          cat:         this.guessCategory(p),
          qty:         parseFloat(p.quantity)||1,
          unit:        this.extractUnit(p.quantity||''),
          expiry,
          ingredients: p.ingredients_text_en||p.ingredients_text||'',
          imageUrl:    p.image_front_url||p.image_url||'',
          barcode,
          nutriScore:  (p.nutriscore_grade||'').toUpperCase(),
          note:        p.packaging||'',
        });
        this.formExpiry.set(expiry);
      }
    } catch {
      this.fetchError.set('Network error. Please check your internet connection.');
      this.product.set({ name:'Scanned Product', brand:'', cat:'pantry', qty:1, unit:'pcs', expiry:this.svc.defaultExpiry(), ingredients:'', imageUrl:'', barcode, nutriScore:'', note:`Barcode: ${barcode}` });
    } finally {
      this.fetching.set(false);
      this.scanning.set(false);
    }
  }

  // ── Save to pantry ───────────────────────────────────────────────
  confirmAdd() {
    const p = this.product(); if (!p) return;
    this.svc.addItem({ name:p.name||'Scanned Item', cat:p.cat, qty:p.qty, unit:p.unit, expiry:this.formExpiry(), note:this.formNote()||p.note, barcode:p.barcode, imageUrl:p.imageUrl, addedVia:'barcode' });
    this.added.set(true);
    this.toast('✅ Saved to pantry!');
    setTimeout(() => this.goBack(), 1800);
  }

  // ── Helpers ──────────────────────────────────────────────────────
  private guessCategory(p: any): FoodCategory {
    const t = (p.categories_tags||[]).join(' ').toLowerCase();
    if (t.includes('dairy')||t.includes('milk')||t.includes('cheese')||t.includes('yogurt')) return 'dairy';
    if (t.includes('meat')||t.includes('fish')||t.includes('seafood')) return 'meat';
    if (t.includes('bread')||t.includes('bakery')||t.includes('pastry')) return 'bakery';
    if (t.includes('beverage')||t.includes('juice')||t.includes('drink')) return 'beverages';
    if (t.includes('frozen')) return 'frozen';
    if (t.includes('vegetable')||t.includes('fruit')) return 'produce';
    return 'pantry';
  }
  private extractUnit(qty: string): string { return qty.match(/[a-zA-Z]+/)?.[0].toLowerCase()||'pcs'; }
  private parseExpiry(d: string): string {
    if (!d) return this.svc.defaultExpiry();
    const c = d.replace(/\//g,'-').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(c)) return c;
    if (/^\d{2}-\d{4}$/.test(c)) { const[m,y]=c.split('-'); return `${y}-${m}-01`; }
    if (/^\d{4}-\d{2}$/.test(c)) return `${c}-01`;
    return this.svc.defaultExpiry();
  }
  nutriColor(s: string): string { return ({A:'#2ecc71',B:'#82c341',C:'#f5c842',D:'#e67e22',E:'#e74c3c'} as any)[s]||'#6a8f6a'; }

  private toast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastVisible.set(true);
    this.toastTimer = setTimeout(()=>this.toastVisible.set(false), 2800);
  }

  // ── Voice Scan ────────────────────────────────────────────────────
  startVoice() {
    this.mode.set('ocr');
    this.ocrText.set('');
    this.voiceError.set('');
    this.voiceListening.set(false);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { this.voiceError.set('Voice recognition not supported in this browser. Use Chrome.'); return; }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    this.voiceListening.set(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      this.ocrText.set(text);
      this.voiceListening.set(false);
      this.parseOCR();
    };
    recognition.onerror = () => {
      this.voiceListening.set(false);
      this.voiceError.set('Could not hear you. Please try again.');
    };
    recognition.onend = () => this.voiceListening.set(false);
    recognition.start();
  }

  ngOnDestroy() { this.stopCamera(); if(this.toastTimer) clearTimeout(this.toastTimer); }
}
