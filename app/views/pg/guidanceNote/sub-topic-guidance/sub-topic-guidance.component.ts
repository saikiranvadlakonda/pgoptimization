import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'sub-topic-guidance',
    templateUrl: './sub-topic-guidance.component.html',
    styleUrls: ['./sub-topic-guidance.component.css']
})
export class SubTopicGuidanceComponent implements OnInit {

    constructor() { }

    @Input() guidances;
    @Input() error: string;
    @Output() showGuidance: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() domainPath: EventEmitter<string> = new EventEmitter<string>();
    @Output() subContent: EventEmitter<any> = new EventEmitter<any>();
    guidanceSearch: string;
    pgMessages: any = PgMessages.constants;
  ngOnInit() {
  }
  //toggleKeySection(id: string) {
  //  document.querySelector("#" + id + " i").classList.toggle('zmdi-plus');
  //  document.querySelector("#" + id + " i").classList.toggle('zmdi-window-minimize');

    showHideGuidance(value: boolean) {
        this.showGuidance.emit(value);
    }
    setGuidanceDomainPath(guidance) {
        this.domainPath.emit(guidance);
    }

    setSubContentDomainPath(subContent) {
        this.subContent.emit(subContent);
    }

}
