// Photoshop Script - Lab Color Adjustments
// This script applies a series of adjustments to Lab color channels.

/*
This is the most common method for running a script.
Open the image you want to work on in Photoshop.
Go to the menu bar and select File > Scripts.
Select the labAdjustments.jsx script from the list. If it doesn't appear, select Browse to navigate to the script file and load it.

What the Script Does
The lab_process.jsx script automates a series of color and detail adjustments using the Lab color space. It's designed to save time by performing multiple steps in a single action.

The script performs the following steps:

It duplicates the active layer to work non-destructively, leaving your original image untouched.
It calculates a scale factor based on the image size to ensure the filter values (like blur radius) are consistent across different resolutions.
It applies specific filters to the Lightness channel (responsible for contrast and detail) and the 'a' and 'b' channels (responsible for color and saturation) to achieve a unique visual effect.

Finally, it renames the new layer to "Adjusted" and displays an alert with the values used, confirming the process is complete.

Important Notes
Always back up your original images before running any script, just in case.

Most scripts assume you have an image already open in Photoshop when you run them.

*/

// Check if a document is open
if (app.documents.length == 0) {
    alert("Please open an image before running this script.");
} else {
    // Set ruler units to pixels
    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    
    try {
        var doc = app.activeDocument;
        
        // Calculate the scale factor based on image size
        // Reference: 2500 x 2500 pixels
        var referenceSize = 2500;
        var imageWidth = doc.width.as("px");
        var imageHeight = doc.height.as("px");
        var maxDimension = Math.max(imageWidth, imageHeight);
        var scaleFactor = maxDimension / referenceSize;
        
        // Original values for 2500x2500px
        var blur1 = 0.2 * scaleFactor;
        var unsharpRadius1 = 2.3 * scaleFactor;
        var blur2 = 4 * scaleFactor;
        var unsharpRadius2 = 5.1 * scaleFactor;
        
        // 0. Duplicate the active layer
        var originalLayer = doc.activeLayer;
        var duplicatedLayer = originalLayer.duplicate();
        doc.activeLayer = duplicatedLayer;
        
        // 1. Convert image mode to Lab without flattening
        doc.changeMode(ChangeMode.LAB);
        
        // 2. Select the Lightness channel and apply Gaussian Blur 0.2
        var lightnessChannel = doc.channels.getByName("Lightness");
        doc.activeChannels = [lightnessChannel];
        doc.activeLayer.applyGaussianBlur(blur1);
        
        // 3. Unsharp Mask: amount 125%, radius 2.3, threshold 18
        doc.activeLayer.applyUnSharpMask(125, unsharpRadius1, 18);
        
        // 4. Distort Ripple 20
        applyRipple(20, "medium");
        
        // 5. Select the 'a' channel
        var aChannel = doc.channels.getByName("a");
        doc.activeChannels = [aChannel];
        
        // 6. Distort Ripple 175
        applyRipple(175, "medium");
        
        // 7. Gaussian Blur 4
        doc.activeLayer.applyGaussianBlur(blur2);
        
        // 8. Unsharp Mask: amount 131%, radius 5.1, threshold 3
        doc.activeLayer.applyUnSharpMask(131, unsharpRadius2, 3);
        
        // 9. Select the 'b' channel and apply the same adjustments as the 'a' channel
        var bChannel = doc.channels.getByName("b");
        doc.activeChannels = [bChannel];
        
        // Ripple 175
        applyRipple(175, "medium");
        
        // Gaussian Blur 4
        doc.activeLayer.applyGaussianBlur(blur2);
        
        // Unsharp Mask: amount 131%, radius 5.1, threshold 3
        doc.activeLayer.applyUnSharpMask(131, unsharpRadius2, 3);
        
        // Restore the selection to all channels (RGB composite)
        var allChannels = [];
        for (var i = 0; i < doc.channels.length; i++) {
            allChannels.push(doc.channels[i]);
        }
        doc.activeChannels = allChannels;
        
        // 10. Rename the layer to "Adjusted"
        duplicatedLayer.name = "Adjusted";
        
        alert("Script executed successfully!\n\n" +
              "Image: " + imageWidth.toFixed(0) + " x " + imageHeight.toFixed(0) + " px\n" +
              "Applied scale factor: " + scaleFactor.toFixed(3) + "x\n" +
              "(Reference: 2500 x 2500 px)\n\n" +
              "Adjusted values:\n" +
              "- Gaussian Blur (Lightness): " + blur1.toFixed(2) + " px\n" +
              "- Unsharp Radius (Lightness): " + unsharpRadius1.toFixed(2) + " px\n" +
              "- Gaussian Blur (a/b): " + blur2.toFixed(2) + " px\n" +
              "- Unsharp Radius (a/b): " + unsharpRadius2.toFixed(2) + " px\n\n" +
              "The 'Adjusted' layer has been created with all adjustments applied.");
        
    } catch (e) {
        alert("Error executing script:\n" + e);
    } finally {
        // Restore original units
        app.preferences.rulerUnits = originalRulerUnits;
    }
}

// Function to apply the Ripple filter using Action Manager
function applyRipple(amount, size) {
    var idRple = charIDToTypeID("Rple");
    var desc = new ActionDescriptor();
    var idAmnt = charIDToTypeID("Amnt");
    desc.putInteger(idAmnt, amount);
    var idRplS = charIDToTypeID("RplS");
    var idRplS2 = charIDToTypeID("RplS");
    var sizeValue;
    
    switch(size.toLowerCase()) {
        case "small":
            sizeValue = charIDToTypeID("Smlr");
            break;
        case "large":
            sizeValue = charIDToTypeID("Lrge");
            break;
        default: // medium
            sizeValue = charIDToTypeID("Mdmm");
            break;
    }
    
    desc.putEnumerated(idRplS, idRplS2, sizeValue);
    var idUndA = charIDToTypeID("UndA");
    var idUndA2 = charIDToTypeID("UndA");
    var idWrpA = charIDToTypeID("WrpA");
    desc.putEnumerated(idUndA, idUndA2, idWrpA);
    executeAction(idRple, desc, DialogModes.NO);
}
