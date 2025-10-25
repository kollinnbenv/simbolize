import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; // 1. IMPORTE AQUI
import { HeaderComponent } from './components/shared/header/header.component';
import { SobreComponent } from './pages/sobre/sobre.component';
import { ContatoComponent } from './pages/contato/contato.component';
import { TextoComponent } from './pages/texto/texto.component';
import { VozComponent } from './pages/voz/voz.component';

export const routes: Routes = [
 
  {
    path: '', // Rota principal (sem nada, ex: localhost:4200)
    component: LoginComponent
  },
  {
    path: '', // Rota principal (sem nada, ex: localhost:4200)
    component: HeaderComponent
  },
  {
    path: 'sobre', // Rota link sobre (ex: localhost:4200/sobre)
    component: SobreComponent
  },
  {
    path: 'contato', // Rota link contato (ex: localhost:4200/contato)
    component: ContatoComponent
  },
  {
    path: 'texto', // Rota link texto (ex: localhost:4200/texto)
    component: TextoComponent
  },
  {
    path: 'voz', // Rota link voz (ex: localhost:4200/voz)
    component: VozComponent
  }
  // (Aqui você adicionará outras rotas depois, ex: 'dashboard')
];