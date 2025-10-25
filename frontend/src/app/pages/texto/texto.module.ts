import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TextoComponent } from './texto.component';

@NgModule({
  declarations: [TextoComponent],
  imports: [CommonModule, FormsModule],
  exports: [TextoComponent] // exporte se o componente for usado fora desse módulo
})
export class TextoModule {}
