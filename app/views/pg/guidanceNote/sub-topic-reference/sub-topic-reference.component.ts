import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'sub-topic-reference',
    templateUrl: './sub-topic-reference.component.html',
    styleUrls: ['./sub-topic-reference.component.css']
})
export class SubTopicReferenceComponent implements OnInit {

    constructor() { }
    pgMessages: any = PgMessages.constants;
    @Input() legislations;
    @Input() commentarys;
    @Input() caseLaws;
    @Input() error: string;
    @Output() showGuidance: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() subContent: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
    }

    showHideGuidance(value: boolean) {
        this.showGuidance.emit(value);
    }
    setSubContentDomainPath(subContent) {
        this.subContent.emit(subContent);
    }
}
