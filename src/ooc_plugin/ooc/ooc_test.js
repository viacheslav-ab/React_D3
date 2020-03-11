import { dualPivotSort, icdf_normal, linspace, set2conf, conf2ooc } from './ooc_module.js';

function icdf_calculation(set) {
    // 1) prepare original data
    var x_data = dualPivotSort(set.slice());
    var y_data = linspace(0.5 / x_data.length, 1.0 - 0.5 / x_data.length, x_data.length);

    // 2) transform y-data
    var y_data_transformed = icdf_normal(y_data.slice());

    var icdf = new Array(x_data.length);
    for (let i = 0; i < x_data.length; ++i) {
        icdf[i] = {x: x_data[i], y: y_data_transformed[i]};
    }
    return icdf;
}

function set2conf_calculation(set0, windowsize, samples, confidences) {
    // calculation icdf data
    var set_0 = new Array(set0.length);
    for (let i = 0; i < set0.length; i++) {
        set_0[i] = set0[i];
    }
    var icdf = icdf_calculation(set_0);

    var layercount = confidences.length;
    if (!layercount) {
        console.log("confidences must be array!");
        return [icdf, null, null];
    }

    var quants = [];

    for (let i = 0; i < layercount; ++i) {
        let quant = set2conf(set_0.slice(), windowsize, samples[i], confidences[i]);
        quants.push(quant);
    }

    return [icdf, quants];
}

function conf2ooc_calculation(quants, set1) {
    var set_1 = new Array(set1.length);
    for (let i = 0; i < set1.length; i++) {
        set_1[i] = set1[i];
    }
    var icdf = icdf_calculation(set_1);

    var layercount = quants.length;
    var windowsize = set_1.length;
    var ooc = [];
    var layers = [];

    var x_data = [];
    for (let j = 0; j < layercount; ++j) {
        x_data = [];
        for (let i = 0; i < windowsize; ++i) {
            x_data.push({x: quants[j].conf_l[i], y: icdf[i].y});
        }
        for (let i = windowsize - 1; i >= 0; --i) {
            x_data.push({x: quants[j].conf_r[i], y: icdf[i].y});
        }
        layers.push(x_data);

        let result = conf2ooc(quants[j], set_1);
        ooc.push(result.ooc);
    }    

    return [icdf, layers, ooc];
}

function ooc_calculation(set_0, set_1, samples, confidences, progressInfo) {
    // calculation icdf data
    var icdf_0 = icdf_calculation(set_0.slice());
    var icdf_1 = icdf_calculation(set_1.slice());

    var layercount = confidences.length;
    if (!layercount) {
        console.log("confidences must be array!");
        return [icdf_0, icdf_1, null, null, null];
    }

    var windowsize = set_1.length;
    var layers = [];
    var quants = [];
    var ooc_result = [];
    var x_data = [];

    for (let j = 0; j < layercount; ++j) {
        x_data = [];
        let quant = set2conf(set_0.slice(), windowsize, samples[j], confidences[j], progressInfo);
        for (let i = 0; i < windowsize; ++i) {
            x_data.push({x: quant.conf_l[i], y: icdf_1[i].y});
        }
        for (let i = windowsize - 1; i >= 0; --i) {
            x_data.push({x: quant.conf_r[i], y: icdf_1[i].y});
        }
        layers.push(x_data);
        quants.push(quant);

        let result = conf2ooc(quant, set_1.slice());
        ooc_result.push(result.ooc);
    }

    return [icdf_0, icdf_1, quants, layers, ooc_result];
}

export { set2conf_calculation, conf2ooc_calculation, ooc_calculation };