import { Directive, OnInit, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { PgConstants } from '../constants/pg.constants';

@Directive({
    selector: '[image-src]',
    host: {
        '[src]': 'sanitizedImageData'
    },
    providers: []
})
export class ImageDirective implements OnInit {
    imageData: any;
    sanitizedImageData: any;
    @Input('image-src') domainPath: string;
    constructor(private http: HttpClient,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {
        var url = PgConstants.constants.WEBAPIURLS.GetImageContent;

        this.http.post(url, { domainPath: this.domainPath }, { withCredentials: false, responseType: "json" })
            .subscribe(
                data => {
                    this.imageData = data;
                    this.imageData = 'data:image/jpg;base64,' + this.imageData.base64String;
                    this.sanitizedImageData = this.sanitizer.bypassSecurityTrustUrl(this.imageData);
                }
            );
    }
}