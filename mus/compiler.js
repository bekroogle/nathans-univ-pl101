// Compiles MUS expressions into NOTE expressions.
//
// Supports 'seq', 'par', and 'note' objects in MUS.

var endTime = function (startTime, musExpr) {
    // If the expression is a note or rest, return start time + expression's duration:
    if (musExpr.tag === 'rest') {
        return startTime + musExpr.duration;

    } else if (musExpr.tag === 'note') {
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
    // If expression is a rest, do simple translation to NOTE format:
    if (musExpr.tag === 'rest') {
        var restRetVal = [{
            tag: 'rest',
            start: startTime,
            duration: musExpr.duration
        }];

        return restRetVal;
    }
    // If expression is a note, do simple translation to NOTE format
    // (Converting pitch-octave notation into midi pitch codes):
    if (musExpr.tag === 'note') {
        var noteRetVal = [{
            tag: 'note',
            pitch: getMidi(musExpr.pitch),
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

// Given a string in form <Pitch><Oct> (e.g. 'c4'), returns the MIDI pitch code.
var getMidi = function(pitchOct) {
    var octave = parseInt(pitchOct.charAt(1), 10);
    var pitch = pitchOct.charAt(0);
    return 20 + (octave * 12) + PitchEnum[pitch];
};

// Enumerates the number of half steps each pitch adds to the current octave.
var PitchEnum = {
    A: 1, a: 1,
    B: 3, b: 3,
    C: 4, c: 4,
    D: 6, d: 6,
    E: 8, e: 8,
    F: 9, f: 9,
    G: 11, g: 11
};

// Testing
// This code taken directly from Nathan's University PL101 - 12.
var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
