
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PictosService, Pictogram } from '../../core/services/pictos.service';

@Component({
  selector: 'app-texto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './texto.component.html',
  styleUrl: './texto.component.scss'
})

export class TextoComponent {
  private pictos = inject(PictosService);

  frase = '';
  loading = false;
  resultado: Pictogram[] = [];

  gerarSimbolos() {
    const q = this.frase?.trim();
    if (!q) { this.resultado = []; return; }

    this.loading = true;
    this.pictos.search(q).subscribe({
      next: (res) => { this.resultado = res; this.loading = false; },
      error: () => { this.resultado = []; this.loading = false; }
    });
  }

  limpar() {
    this.frase = '';
    this.resultado = [];
  }

  exportar() {
    // MVP: exportar como JSON baixável
    const blob = new Blob([JSON.stringify(this.resultado, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'simbolos.json'; a.click();
    URL.revokeObjectURL(url);
  }
}
