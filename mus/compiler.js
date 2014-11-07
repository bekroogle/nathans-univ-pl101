// Compiles MUS expressions into NOTE expressions.
//
// Supports 'seq', 'par', and 'note' objects in MUS.

var endTime = function (startTime, musExpr) {
    // If the expression is a note, return start time + note's duration:
    if (musExpr.tag === 'note') {
        return startTime + musExpr.dur;
    
    // If it's a sequence, return start time + first note's duration + second note's duration:
    } else if (musExpr.tag === 'seq') {
        return endTime(endTime(startTime, musExpr.left),
        musExpr.right);
        
    // If it's a parallel, return start time + the longest of the expression's child nodes:
    } else if (musExpr.tag === 'par') {
        return max(endTime(startTime, musExpr.left),
        endTime(startTime, musExpr.right));
    }
};

var max = function (a, b) {
    // Return the greater of the two params:
    return a > b ? a : b;
};

// Recursive compile from time
var compileT = function (startTime, musExpr) {
    
    // If expression is a note, do simple translation to NOTE format:
    if (musExpr.tag === 'note') {
        var noteRetVal = [{
            tag: 'note',
            pitch: musExpr.pitch,
            start: startTime,
            dur: musExpr.dur
        }];
        
        return noteRetVal;

    // If expression is a sequence, return a list comprising the left child (starting at
    // the start time), concatenated with the right child (starting at the end time of 
    // the left child):
    } else if (musExpr.tag === 'seq') {
        var seqRetVal = [];
        seqRetVal = seqRetVal.concat(compileT(startTime, musExpr.left));
        seqRetVal = seqRetVal.concat(compileT(endTime(startTime, musExpr.left), musExpr.right));
        
        return seqRetVal;
    
    // If expression is parallel, return a list comprising the left child
    // concatenated with the right child:
    } else if (musExpr.tag === 'par') {
        var parRetVal = [];
        parRetVal = parRetVal.concat(compileT(startTime, musExpr.left));
        parRetVal = parRetVal.concat(compileT(startTime, musExpr.right));
        
        return parRetVal;
    }
};

// This is a wrapper function to call the recursive compileT with a start time of 0.
var compile = function (musExpr) {
    return compileT(0, musExpr);
};
