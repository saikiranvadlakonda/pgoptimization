import { Component, Input, Output,EventEmitter } from '@angular/core';

@Component({
    selector: 'app-Repopg-tab-menu',
    templateUrl: './pg-Repotab-menu.component.html',
    styleUrls: ['./pg-Repotab-menu.component.css']
})
export class PgRepoTabMenuComponent {
    @Input() tabs = [];
    @Input() activeTab = -1;

    @Output() tabClicked: EventEmitter<number> = new EventEmitter();
    constructor() {  }

    _tabClicked(tabIndex: number) {
        this.activeTab = tabIndex;
        this.tabClicked.emit(tabIndex);
    }
}
