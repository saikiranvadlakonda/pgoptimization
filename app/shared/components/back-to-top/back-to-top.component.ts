import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/platform-browser";

@Component({
    selector: 'app-back-to-top',
    templateUrl: './back-to-top.component.html',
    styleUrls: ['./back-to-top.component.scss']
})
export class BackToTopComponent implements OnInit {


    windowScrolled: boolean;

    constructor(@Inject(DOCUMENT) private document: Document) { }
    onWindowScroll() {
        if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
            this.windowScrolled = true;
        }
        else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
            this.windowScrolled = false;
        }
    }

    scrollToTop() {
        (function smoothscroll() {
            var currentScroll = document.getElementById('newpg').scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                document.getElementById('newpg').scrollTo(0, currentScroll - (currentScroll / 8));
            }
        })();
    }

    ngOnInit() {
    }

}