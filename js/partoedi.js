// Sample data from parted
/*
[
	{
		"path":"/dev/sda",
		"size":8589934592,
		"model":"ATA VBOX HARDDISK",
		"label":"msdos",
		"partitions": [
			{"id":1,"parent":-1,"start":32256,"end":8587191808,"size":8587160064,"type":"DEVICE_PARTITION_TYPE_EXTENDED","filesystem":"","description":""},
			{"id":-1,"parent":-1,"start":32256,"end":64000,"size":32256,"type":"DEVICE_PARTITION_TYPE_FREESPACE","filesystem":"","description":""},
			{"id":5,"parent":-1,"start":64512,"end":1077511168,"size":1077447168,"type":"DEVICE_PARTITION_TYPE_LOGICAL","filesystem":"linux-swap(v1)","description":""},
			{"id":-1,"parent":-1,"start":1077511680,"end":2146797568,"size":1069286400,"type":"DEVICE_PARTITION_TYPE_FREESPACE","filesystem":"","description":""},
			{"id":-1,"parent":-1,"start":2146798080,"end":2146829824,"size":32256,"type":"DEVICE_PARTITION_TYPE_FREESPACE","filesystem":"","description":""},
			{"id":6,"parent":-1,"start":2146830336,"end":8587191808,"size":6440361984,"type":"DEVICE_PARTITION_TYPE_LOGICAL","filesystem":"ext4","description":"BlankOn rote (8.0)"},
			{"id":-1,"parent":-1,"start":8587192320,"end":8589934080,"size":2742272,"type":"DEVICE_PARTITION_TYPE_METADATA","filesystem":"","description":""}
		]
	},
	{
		"path":"/dev/sdb",
		"size":8589934592,
		"model":"ATA VBOX HARDDISK",
		"label":"",
		"partitions": [
			{"id":-1,"parent":0,"start":0,"end":8589934591,"size":8589934591,"type":"DEVICE_PARTITION_TYPE_FREESPACE","filesystem":"","description":""}
		]
	}
]
*/

var Partoedi = function() {
    var gbSize = 1073741824;
    var minimumPartitionSize = 4 * gbSize;

    var createDisk = function(device) {
        var diskPath = device.path;
        var diskSize = (device.size / gbSize).toFixed(2);
        var diskModel = device.model;
        var diskType = device.label;

        var diskLayer = new Kinetic.Layer();

        var hasExtended = false;
        var lastX = 0;

        for (var j = 0; j < device.partitions.length; j++) {
            var p = device.partitions[j];
            if (p.size <= (0.01 * gbSize)) {
                continue;
            }

            // Used or Freespace partition
            if (p.id > 0) {
                // Primary, Extended, or Logical partitions
                if (p.type.indexOf("NORMAL") > 0) {
                    var sizePercen = ((p.size / gbSize).toFixed(2) / diskSize) * 100;
                    var sizeWidth = (sizePercen * 600) / 100;

                    var group = new Kinetic.Group({
                      x: lastX,
                      y: 0,
                      draggable: true,
                      dragConstraint: 'horizontal'
                    });

                    var rect = new Kinetic.Rect({
                        name: "rect",
                        x: lastX,
                        y: 0,
                        width: sizeWidth,
                        height: 100,
                        fill: '#3D52DF',
                        stroke: 'white',
                        strokeWidth: 2,
                        cornerRadius: 5,
                        lineJoin: "round"
                    });
                    
                    if (p.size > minimumPartitionSize ) {
                        rect.on('click', function() {
                            _clearSelected(diskLayer);
                            this.setStroke('gray');
                            this.getLayer().draw();
                        });

                        /*rect.on('mouseover', function() {
                          this.setWidth(this.getWidth() - 5);
                          this.getLayer().draw();
                        });*/                               
                    }

                    group.add(rect);
                    addAnchor(group, lastX, 25, "resize");
                    
                    lastX = lastX + sizeWidth;
                    diskLayer.add(group);
                    console.log("PRIMARY");
                } else if (p.type.indexOf("EXTENDED") > 0) {
                    var sizePercen = ((p.size / gbSize).toFixed(2) / diskSize) * 100;
                    var sizeWidth = (sizePercen * 600) / 100;
                    var rect = new Kinetic.Rect({
                        name: device.path + p.id,
                        x: lastX,
                        y: 0,
                        width: sizeWidth,
                        height: 50,
                        fill: '#3D52DF',
                        stroke: 'white',
                        strokeWidth: 2,
                        cornerRadius: 5,
                        lineJoin: "round"
                    });
                    
                    lastX = lastX;
                    
                    var text = new Kinetic.Text({
                        text: 'Extended',
                        textFill: 'white',
                        fontSize: 12,
                        x: (sizeWidth/2) + lastX,
                        y: 25
                    });

                    diskLayer.add(text);
                    diskLayer.add(rect);
                    hasExtended = true;
                    console.log("EXTENDED");
                } else if (p.type.indexOf("LOGICAL") > 0) {
                    // Logical is Extended partition content
                    if (hasExtended) {
                        var sizePercen = ((p.size / gbSize).toFixed(2) / diskSize) * 100;
                        var sizeWidth = (sizePercen * 600) / 100;
                        var rect = new Kinetic.Rect({
                            name: device.path + p.id,
                            x: lastX,
                            y: 50,
                            width: sizeWidth,
                            height: 50,
                            fill: 'red',
                            stroke: 'white',
                            strokeWidth: 2,
                            cornerRadius: 5,
                            lineJoin: "round"
                        });
                        
                        if (p.size > minimumPartitionSize) {
                            rect.on('click', function() {
                                _clearSelected(diskLayer);
                                this.setStroke('gray');
                                this.getLayer().draw();
                            });

                          rect.on('mouseover', function() {
                            this.setWidth(this.getWidth() - 5);
                            this.getLayer().draw();
                          });
                        }
                        
                        lastX = lastX + sizeWidth;

                        diskLayer.add(rect);
                        console.log("LOGICAL");
                    }
                }
            } else if (p.type.indexOf("FREESPACE") > 0) {
                // Primary or Extended freespace
                if (!hasExtended) {
                    var sizePercen = ((p.size / gbSize).toFixed(2) / diskSize) * 100;
                    var sizeWidth = (sizePercen * 600) / 100;
                    var rect = new Kinetic.Rect({
                        x: lastX,
                        y: 0,
                        width: sizeWidth,
                        height: 100,
                        fill: 'gray',
                        stroke: 'white',
                        strokeWidth: 2,
                        cornerRadius: 5,
                        lineJoin: "round"
                    });
                    
                    if (p.size > minimumPartitionSize ) {
                        rect.on('click', function() {
                            _clearSelected(diskLayer);
                            this.setStroke('gray');
                            this.getLayer().draw();
                        });

                        rect.on('mouseover', function() {
                          this.setWidth(this.getWidth() - 5);
                          this.getLayer().draw();
                        });
                    }
                    
                    lastX = lastX + sizeWidth;

                    diskLayer.add(rect);
                    console.log("PRIMARY FREESPACE");
                } else {
                    var sizePercen = ((p.size / gbSize).toFixed(2) / diskSize) * 100;
                    var sizeWidth = (sizePercen * 600) / 100;
                    var rect = new Kinetic.Rect({
                        x: lastX,
                        y: 50,
                        width: sizeWidth,
                        height: 50,
                        fill: 'gray',
                        stroke: 'white',
                        strokeWidth: 2,
                        cornerRadius: 5,
                        lineJoin: "round"
                    });
                    
                    if (p.size > minimumPartitionSize) {
                        rect.on('click', function() {
                            _clearSelected(diskLayer);
                            this.setStroke('gray');
                            this.getLayer().draw();
                        });

                        rect.on('mouseover', function() {
                          this.setWidth(this.getWidth() - 5);
                          this.getLayer().draw();
                        });
                    }
                    
                    lastX = lastX + sizeWidth;

                    diskLayer.add(rect);
                    console.log("EXTENDED FREESPACE");
                }
            }
        }

        return diskLayer;
    }

    var update = function(group, activeAnchor) {
        /*var topLeft = group.get(".topLeft")[0];
        var topRight = group.get(".topRight")[0];
        var bottomRight = group.get(".bottomRight")[0];
        var bottomLeft = group.get(".bottomLeft")[0];
        var image = group.get(".image")[0];*/
        var resize = group.get(".resize")[0];
        var rect = group.get(".rect")[0];

        // update anchor positions
        /*switch (activeAnchor.getName()) {
          case "topLeft":
            topRight.attrs.y = activeAnchor.attrs.y;
            bottomLeft.attrs.x = activeAnchor.attrs.x;
            break;
          case "topRight":
            topLeft.attrs.y = activeAnchor.attrs.y;
            bottomRight.attrs.x = activeAnchor.attrs.x;
            break;
          case "bottomRight":
            bottomLeft.attrs.y = activeAnchor.attrs.y;
            topRight.attrs.x = activeAnchor.attrs.x;
            break;
          case "bottomLeft":
            bottomRight.attrs.y = activeAnchor.attrs.y;
            topLeft.attrs.x = activeAnchor.attrs.x;
            break;
        }*/

        resize.attrs.y = activeAnchor.attrs.y;
        resize.attrs.x = activeAnchor.attrs.x;

        /*image.setPosition(topLeft.attrs.x, topLeft.attrs.y);*/

        /*var width = topRight.attrs.x - topLeft.attrs.x;
        var height = bottomLeft.attrs.y - topLeft.attrs.y;*/

        var width = resize.attrs.x - rect.attrs.x;
        var height = resize.attrs.y - rect.attrs.y;
        if(width && height) {
          image.setSize(width, height);
        }
      }
      
      var addAnchor = function(group, x, y, name) {
        var stage = group.getStage();
        var layer = group.getLayer();

        var anchor = new Kinetic.Circle({
          x: x,
          y: y,
          stroke: "#666",
          fill: "#ddd",
          strokeWidth: 2,
          radius: 8,
          name: name,
          draggable: true
        });

        anchor.on("dragmove", function() {
          update(group, this);
          layer.draw();
        });
        anchor.on("mousedown touchstart", function() {
          group.setDraggable(false);
          this.moveToTop();
        });
        anchor.on("dragend", function() {
          group.setDraggable(true);
          layer.draw();
        });
        // add hover styling
        anchor.on("mouseover", function() {
          var layer = this.getLayer();
          document.body.style.cursor = "pointer";
          this.setStrokeWidth(4);
          layer.draw();
        });
        anchor.on("mouseout", function() {
          var layer = this.getLayer();
          document.body.style.cursor = "default";
          this.setStrokeWidth(2);
          layer.draw();
        });

        group.add(anchor);
    }

    var _clearSelected = function(deviceLayer) {
        for (var n = 0; n < deviceLayer.getChildren().length; n++) {
            var rect = deviceLayer.getChildren()[n];
            if (rect.getStroke() == 'gray') {
                rect.setStroke('white');
                rect.getLayer().draw();
            }
        };
    }
        
    var selectedPartition = function(deviceLayer) {
        var selected;
        for (var n = 0; n < deviceLayer.getChildren().length; n++) {
            var rect = deviceLayer.getChildren()[n];
            if (rect.getStroke() == 'gray') {
                selected = rect;
            }
        };        
                
        return selected;
    }        

    return {
        createDisk: createDisk,
        selectedPartition: selectedPartition
    }
}();
