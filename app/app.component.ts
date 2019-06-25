import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import fontawesome from '@fortawesome/fontawesome';
import faTrashAlt from '@fortawesome/fontawesome-free-regular/';
import { PgConstants } from './shared/constants/pg.constants';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/pairwise';
import { NavigationService } from './shared/services/navigation/navigation.service';
import { AuthService } from './shared/services/auth/auth.service';
import { DataStoreService } from './shared/services/data-store/data-store.service';
import 'scss/style.scss';
import { Subject } from 'rxjs/Subject';
import { Location } from "@angular/common";
import { PagerService } from './shared/services/pager/pager.service';
import { PgModalService } from './shared/services/pg-modal/pg-modal.service';
import { environment } from '../environments/environment';
import BackendHost from './shared/constants/backendhost';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit {
    public webApiEndPoint: string;
    public imagesDirectory: string;
    public userName: string;
    public password: string;
    private popState: boolean = false;
    private urlHistory: string[] = [];
    private popSubject: Subject<boolean> = new Subject(); scrollVal;
  constructor(private elementRef: ElementRef,
        private _router: Router,
        private _navigationService: NavigationService,
        private _authService: AuthService,
        private _dataStoreService: DataStoreService,
        private location: Location,
        private _pager: PagerService,
        private _modalService: PgModalService
    ) {
        fontawesome.library.add(faTrashAlt);
        let native = this.elementRef.nativeElement;

    this.webApiEndPoint = native.getAttribute("webApiEndPoint");

    BackendHost.getInstance().setHost(this.webApiEndPoint.toString());
    
  
        this.imagesDirectory = native.getAttribute("imagesDirectory");
        this.userName = native.getAttribute("username");
        this.password = native.getAttribute("password");
    }

    ngOnDestroy() {
        this._dataStoreService.clearSessionStorage();
    }

    ngOnInit() {
        var self = this;
        if (window.parent) {
            try {
                window.parent.postMessage("Hello world from PG", "*");
            }
            catch (e) {
             
            }
        }

        if (window.addEventListener) {
            window.addEventListener("message", function (e) {
                if (e.data == "navigateToDashboard" && window.location.href.indexOf("/dashboard") == -1) {
                    self._navigationService.navigate(PgConstants.constants.URLS.Dashboard.Dashboard);
                } else if (e.data == "navigateToHistoryList" && window.location.href.indexOf("/history") == -1) {
                    self._navigationService.navigate(PgConstants.constants.URLS.History.HistoryList);
                }
                if (e.data && e.data.indexOf && e.data.indexOf("height") != -1) {
                    var height = e.data.split("height:");
                    var element = document.getElementById("newpg");
                    var header2 = document.getElementById("myHeader2");
                    var hHeight = parseFloat(window.getComputedStyle(header2).height.replace("px", ''));

                    height = parseInt(height[1]) - (hHeight + 35);
                    height = (height < 10 ? 100 : height) + "px";
                    element.style.height = height;
                    element.style.minHeight = height;
                    //element.style.marginTop = hHeight + "px";
                    element.style.marginBottom = "35px";
                    element = document.getElementById("backToClassicBtn");
                    element.style.display = "";
                    //document.getElementById("myHeader1").style.display = "none";
                    self._pager.mobiView = false;
                }
                if (e.data && e.data.indexOf && e.data.indexOf("logout") != -1) {
                    self._authService.logout();
                }

                if (e.data && e.data.indexOf && e.data.indexOf("feedback") != -1) {
                    self._modalService.openFeedback();
                }

                if (e.origin == window.location.href && e.data && e.data.indexOf && e.data.indexOf("Hello") != -1) {
                    //console.log("Same origin");
                }
            }, false);
        }/* else if (window.attachEvent) {
            window.attachEvent('onmessage', function (e) {
            });
        }*/
    }

    isScrolled(ev) {
        this.scrollVal = ev;
    }
}
