import { Component, Input } from '@angular/core';

@Component({
    selector: 'pg-content-view',
    templateUrl: './pg-content-view.component.html',
    styleUrls: ['./pg-content-view.component.css']
})
export class PGContentViewComponent {

    @Input() contentHTML: string;
    @Input() title: string;

    constructor() { }
    
}
