var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var router_1 = require('angular2/router');
/**
 * RouterActive dynamically finds the first element with routerLink and toggles the active class
 *
 * ## Use
 *
 * ```
 * <li router-active="active"><a [routerLink]=" ['/Home'] ">Home</a></li>
 * <li [routerActive]=" activeStringValue "><a [routerLink]=" ['/Home'] ">Home</a></li>
 * ```
 */
let RouterActive = class {
    constructor(router, element, renderer, routerLink, routerActiveAttr) {
        this.router = router;
        this.element = element;
        this.renderer = renderer;
        this.routerLink = routerLink;
        this.routerActive = null;
        this.routerActiveAttr = 'active';
        this.routerActiveAttr = this._defaultAttrValue(routerActiveAttr);
    }
    ngOnInit() {
        this.router.subscribe(() => {
            if (this.routerLink.first) {
                let active = this.routerLink.first.isRouteActive;
                this.renderer.setElementClass(this.element.nativeElement, this._attrOrProp(), active);
            }
        });
    }
    _defaultAttrValue(attr) {
        return this.routerActiveAttr = attr || this.routerActiveAttr;
    }
    _attrOrProp() {
        return lang_1.isPresent(this.routerActive) ? this.routerActive : this.routerActiveAttr;
    }
};
RouterActive = __decorate([
    core_1.Directive({
        selector: '[router-active], [routerActive]',
        inputs: ['routerActive']
    }),
    __param(3, core_1.Query(router_1.RouterLink)),
    __param(4, core_1.Optional()),
    __param(4, core_1.Attribute('router-active'))
], RouterActive);
exports.RouterActive = RouterActive;
