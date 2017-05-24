var _ = require('lodash');

function System(_node) {
    _.extend(this, _node.properties);
    
    if (this.id) {
        this.id = this.id.toNumber();
    }
    if (this.SysID) {
        this.AIT_ID = this.AIT_ID;
    }
    if (this.name){
        this.name = this.name;
    }
    if (this.Org){
        this.Org = this.Org;
    }
    
    if (this.isADS){
        this.isADS = this.isADS;
    }
}

module.exports = System;
