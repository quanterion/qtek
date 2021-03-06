define(function(require) {

    'use strict';

    var StaticGeometry = require('../StaticGeometry');
    var Plane = require('./Plane');
    var Matrix4 = require('../math/Matrix4');
    var Vector3 = require('../math/Vector3');
    var BoundingBox = require('../math/BoundingBox');
    var vendor = require('../core/vendor');

    var planeMatrix = new Matrix4();

    /**
     * @constructor qtek.geometry.Cube
     * @extends qtek.StaticGeometry
     * @param {Object} [opt]
     * @param {number} [opt.widthSegments]
     * @param {number} [opt.heightSegments]
     * @param {number} [opt.depthSegments]
     * @param {boolean} [opt.inside]
     */
    var Cube = StaticGeometry.extend(
    /**@lends qtek.geometry.Cube# */
    {
        /**
         * @type {number}
         */
        widthSegments: 1,
        /**
         * @type {number}
         */
        heightSegments: 1,
        /**
         * @type {number}
         */
        depthSegments: 1,
        /**
         * @type {boolean}
         */
        inside: false
    }, function() {
        this.build();
    },
    /** @lends qtek.geometry.Cube.prototype */
    {
        /**
         * Build cube geometry
         */
        build: function() {

            var planes = {
                'px': createPlane('px', this.depthSegments, this.heightSegments),
                'nx': createPlane('nx', this.depthSegments, this.heightSegments),
                'py': createPlane('py', this.widthSegments, this.depthSegments),
                'ny': createPlane('ny', this.widthSegments, this.depthSegments),
                'pz': createPlane('pz', this.widthSegments, this.heightSegments),
                'nz': createPlane('nz', this.widthSegments, this.heightSegments),
            };

            var attrList = ['position', 'texcoord0', 'normal'];
            var vertexNumber = 0;
            var faceNumber = 0;
            for (var pos in planes) {
                vertexNumber += planes[pos].vertexCount;
                faceNumber += planes[pos].faces.length;
            }
            for (var k = 0; k < attrList.length; k++) {
                this.attributes[attrList[k]].init(vertexNumber);
            }
            this.faces = new vendor.Uint16Array(faceNumber);
            var faceOffset = 0;
            var vertexOffset = 0;
            for (var pos in planes) {
                var plane = planes[pos];
                for (var k = 0; k < attrList.length; k++) {
                    var attrName = attrList[k];
                    var attrArray = plane.attributes[attrName].value;
                    var attrSize = plane.attributes[attrName].size;
                    var isNormal = attrName === 'normal';
                    for (var i = 0; i < attrArray.length; i++) {
                        var value = attrArray[i];
                        if (this.inside && isNormal) {
                            value = -value;
                        }
                        this.attributes[attrName].value[i + attrSize * vertexOffset] = value;
                    }
                }
                for (var i = 0; i < plane.faces.length; i++) {
                    this.faces[i + faceOffset] = vertexOffset + plane.faces[i];
                }
                faceOffset += plane.faces.length;
                vertexOffset += plane.vertexCount;
            }

            this.boundingBox = new BoundingBox();
            this.boundingBox.max.set(1, 1, 1);
            this.boundingBox.min.set(-1, -1, -1);
        }
    });

    function createPlane(pos, widthSegments, heightSegments) {

        planeMatrix.identity();

        var plane = new Plane({
            widthSegments: widthSegments,
            heightSegments: heightSegments
        });

        switch(pos) {
            case 'px':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.POSITIVE_X);
                Matrix4.rotateY(planeMatrix, planeMatrix, Math.PI / 2);
                break;
            case 'nx':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.NEGATIVE_X);
                Matrix4.rotateY(planeMatrix, planeMatrix, -Math.PI / 2);
                break;
            case 'py':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.POSITIVE_Y);
                Matrix4.rotateX(planeMatrix, planeMatrix, -Math.PI / 2);
                break;
            case 'ny':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.NEGATIVE_Y);
                Matrix4.rotateX(planeMatrix, planeMatrix, Math.PI / 2);
                break;
            case 'pz':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.POSITIVE_Z);
                break;
            case 'nz':
                Matrix4.translate(planeMatrix, planeMatrix, Vector3.NEGATIVE_Z);
                Matrix4.rotateY(planeMatrix, planeMatrix, Math.PI);
                break;
        }
        plane.applyTransform(planeMatrix);
        return plane;
    }

    return Cube;
});