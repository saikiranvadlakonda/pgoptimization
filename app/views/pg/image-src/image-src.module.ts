import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDirective } from '../../../shared/directives/image.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [ImageDirective],
    exports: [ImageDirective]
})
export class ImageSrcModule { }
