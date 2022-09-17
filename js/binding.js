/* https://www.atmosera.com/blog/data-binding-pure-javascript/ */

export default class Binding {

    constructor(b) {
        var _this = this;

        this.element = b.element;
        this.type = b.type;
        this.value = b.object[b.property];
        this.attribute = b.attribute ? b.attribute : 'textContent';

        this.valueGetter = function(){
            return _this.value;
        }

        this.valueSetter = function(val){
            _this.value = val;
            _this.setAttribute();
        }
    
        Object.defineProperty(b.object, b.property, {
            get: this.valueGetter,
            set: this.valueSetter
        });	

        b.object[b.property] = this.value;
        
        this.setAttribute();

    }

    setAttribute() {

        if (this.element) {
            if (this.type === 'money') {
                this.element[this.attribute] = this.formatMoney(Math.round(this.value));
            } else if (this.type === 'resource') {
                this.element[this.attribute] = this.value.toFixed(2);
            } else {
                this.element[this.attribute] = this.value;
            }
        } else {
            console.log('No container for: ', this.value);
        }

    }

    formatMoney(x) {

        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    }

}
