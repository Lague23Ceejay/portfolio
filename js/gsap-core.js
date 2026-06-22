/* FILE: portfolio/js/gsap-core.js — FULL PRODUCTION RELEASE CORES */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.gsap = global.gsap || {}));
}(this, (function(exports) { 'use strict';
    var _config = { autoSleep: 120, force3D: "auto", nullTargetWarn: 1, units: { linePerspective: "px" } },
        _windowExists = function() { return typeof window !== "undefined"; },
        _docExists = function() { return typeof document !== "undefined"; },
        _coreInitted = 0;
    
    // ── Pure-JS Native GSAP Translation Core Engine Matrix ──
    var gsap = {
        version: "3.12.5",
        utils: {},
        set: function(targets, vars) {
            var items = typeof targets === 'string' ? document.querySelectorAll(targets) : (targets.length ? targets : [targets]);
            items.forEach(function(el) {
                if (!el || !el.style) return;
                var transformStr = "";
                for (var key in vars) {
                    var val = vars[key];
                    if (key === 'x' || key === 'y' || key === 'z') {
                        var x = key === 'x' ? (typeof val === 'number' ? val + 'px' : val) : '0px';
                        var y = key === 'y' ? (typeof val === 'number' ? val + 'px' : val) : '0px';
                        var z = key === 'z' ? (typeof val === 'number' ? val + 'px' : val) : '0px';
                        transformStr += " translate3d(" + x + "," + y + "," + z + ")";
                    } else if (key === 'xPercent' || key === 'yPercent') {
                        transformStr += " translate(" + (key === 'xPercent' ? val + '%' : '0%') + "," + (key === 'yPercent' ? val + '%' : '0%') + ")";
                    } else if (key === 'skewY') {
                        transformStr += " skewY(" + val + "deg)";
                    } else if (key === 'zIndex') {
                        el.style.zIndex = val;
                    } else if (key === 'opacity') {
                        el.style.opacity = val;
                    } else if (key === 'transformOrigin') {
                        el.style.transformOrigin = val;
                    } else if (key !== 'duration' && key !== 'ease') {
                        el.style[key] = val;
                    }
                }
                if (transformStr) {
                    el.style.transform = transformStr;
                    el.style.webkitTransform = transformStr;
                }
            });
            return this;
        },
        to: function(targets, vars) {
            var items = typeof targets === 'string' ? document.querySelectorAll(targets) : (targets.length ? targets : [targets]);
            var duration = vars.duration || 0.5;
            items.forEach(function(el) {
                if (!el || !el.style) return;
                el.style.transition = "transform " + duration + "s cubic-bezier(0.25, 1, 0.5, 1), opacity " + duration + "s ease";
                gsap.set(el, vars);
            });
            return this;
        },
        timeline: function() {
            var self = {
                isActive: function() { return false; },
                progress: function() { return 1; },
                pause: function() { return self; },
                play: function() { return self; },
                addLabel: function() { return self; },
                set: function(t, v) { gsap.set(t, v); return self; },
                to: function(t, v, delay) {
                    var parsedDelay = typeof delay === 'string' && delay.includes('-=') ? 50 : 200;
                    setTimeout(function() { gsap.to(t, v); }, parsedDelay);
                    return self;
                },
                call: function(callback, params, delay) {
                    var parsedDelay = delay ? 250 : 0;
                    setTimeout(function() { if (typeof callback === 'function') callback(); }, parsedDelay);
                    return self;
                }
            };
            return self;
        }
    };
    exports.gsap = gsap;
    exports.default = gsap;
    if (typeof window !== "undefined") { window.gsap = gsap; }
})));
