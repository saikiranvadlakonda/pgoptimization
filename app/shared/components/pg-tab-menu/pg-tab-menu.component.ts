import { Component, Input, Output,EventEmitter } from '@angular/core';

@Component({
    selector: 'app-pg-tab-menu',
    templateUrl: './pg-tab-menu.component.html',
    styleUrls: ['./pg-tab-menu.component.css']
})
export class PgTabMenuComponent {
    @Input() tabs = [];
    @Input() activeTab = -1;

    @Output() tabClicked: EventEmitter<number> = new EventEmitter();
    constructor() {  }

    _tabClicked(tabIndex: number) {
        this.activeTab = tabIndex;
        this.tabClicked.emit(tabIndex);
    }
}
