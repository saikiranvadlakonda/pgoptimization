import { Directive, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[appBackToTop]'
})
export class BackToTopDirective {

    isShow: boolean;
    topPosToStartShowing = 0;

    constructor(private el: ElementRef) { }

    @Output() scrolled = new EventEmitter();

    @HostListener('scroll')
    checkScroll() {
        const scrollPosition = this.el.nativeElement.pageYOffset || this.el.nativeElement.scrollTop;

        this.scrolled.emit(scrollPosition);
        if (scrollPosition >= this.topPosToStartShowing) {
            this.isShow = true;
        } else {
            this.isShow = false;
        }
    }

}
