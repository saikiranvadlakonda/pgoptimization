import { Injectable } from '@angular/core';
import { HttpParameterCodec } from '@angular/common/http';

@Injectable()
export class CustomEncoder implements HttpParameterCodec {
    constructor() { }
    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }
}