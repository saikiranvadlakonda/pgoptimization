import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';


@Pipe({
    name: 'sanitize',
    pure: true
})
export class ContentSafePipe implements PipeTransform {

    constructor(protected sanitizer: DomSanitizer) { }

    public transform(htmlContent: any) {
        // let sanitizeHtmlContent = this.domSanitizer.bypassSecurityTrustHtml(htmlContent);
 
        const fragment = document.createRange().createContextualFragment(htmlContent);
        document.getElementById('docp').innerHTML = "";
        document.getElementById('docp').appendChild(fragment);

    }



}