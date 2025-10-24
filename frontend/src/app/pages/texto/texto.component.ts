import { Component } from '@angular/core';
import { PictosService, Picto } from '../../core/services/pictos.service';

@Component({
  selector: 'app-texto',
  templateUrl: './texto.component.html',
  // styleUrls: ['./texto.component.css'] // se existir o css
})
export class TextoComponent {
  frase = '';
  loading = false;
  errorMsg = '';
  pics: Picto[] = [];

  currentYear = new Date().getFullYear();

  constructor(private pictos: PictosService) {}

  gerarSimbolos() {
    this.errorMsg = '';
    this.pics = [];
    const q = (this.frase || '').trim();

    if (!q) {
      this.errorMsg = 'Digite uma frase para gerar os símbolos.';
      return;
    }

    this.loading = true;

    this.pictos.searchChosen(q).subscribe({
      next: (res: Picto[]) => {
        this.pics = res ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg = 'Não foi possível gerar os símbolos agora.';
        this.loading = false;
      }
    });
  }
}
