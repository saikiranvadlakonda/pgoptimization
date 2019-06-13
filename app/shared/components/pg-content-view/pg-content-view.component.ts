import { Component, Input } from '@angular/core';
import { NewItemEntity } from '../../../shared/models/whats-new/new-group.model';
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
