/* import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { FileUploadComponent } from "./components/file-upload/file-upload.component";
import { ChatInterfaceComponent } from "./components/chat-interface/chat-interface.component";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    
    constructor(private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (localStorage.getItem('authToken')) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}

const routes: Routes = [
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'upload', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: 'chat-documents', component: ChatInterfaceComponent, canActivate: [AuthGuard] },
]; */