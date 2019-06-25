import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-pdf-viewer',
    templateUrl: './pdf-viewer.component.html',
    styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit {

    constructor() { }

    @Input() pdfContent: any;

    ngOnInit() {
    }

}
