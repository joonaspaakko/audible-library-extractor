export default {
  data: function() {
    return {
      presets: [
        {
          name: 'piano-swipe-fade',
          description: 'Animates one row at a time time.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          covers: function(covers) { return covers.perRow; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 9, // Seconds. Length of one animation cycle.
          animationZone: 15, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'piano-swipe-fade-top',
          description: 'Animates one row at a time time.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in-top'], // Falsy value = all animations.
          covers: function(covers) { return covers.perRow; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: function(covers) { return covers.perRow; }, // Seconds. Length of one animation cycle.
          animationZone: 15, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'sequential',
          description: 'Animates one cover at a time sequentially.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          covers: 1, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: .7, // Seconds. Length of one animation cycle.
          animationZone: 100, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'sequential-fade-in',
          description: 'Animates one cover at a time sequentially.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          covers: 1, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 1, // Seconds. Length of one animation cycle.
          animationZone: 70, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'sequential-bounce-in',
          description: 'Animates one cover at a time sequentially.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['bounce-in-fwd'], // Falsy value = all animations.
          covers: 1, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 1, // Seconds. Length of one animation cycle.
          animationZone: 70, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'randomly-regular',
          description: 'Animates 3 covers every 5 seconds.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: 5, // Seconds. Length of one animation cycle.
          covers: 3, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'random',
          description: 'Randomly animates 1-6 covers every 5 seconds.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: 5, // Seconds. Length of one animation cycle.
          covers: 6, // How many covers to animate in one cycle
          randomCovers: true, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'random-just-fade',
          description: 'Randomly animates 1-6 covers every 5 seconds.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          cycleDelay: 5, // Seconds. Length of one animation cycle.
          covers: 6, // How many covers to animate in one cycle
          randomCovers: true, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'random-simple-flips',
          description: 'Randomly animates 1-6 covers every 5 seconds.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          //use: ['flip-horizontal-bottom', 'flip-horizontal-top', 'flip-vertical-right', 'flip-vertical-left', 'flip-diagonal-2-tl', 'flip-diagonal-2-br', 'flip-diagonal-1-bl', 'flip-diagonal-1-tr' ], // Falsy value = all animations.
          use: [ "flip-2-hor-top-2", "flip-2-hor-top-1", "flip-2-ver-right-2", "flip-2-ver-right-1", "flip-2-hor-bottom-2", "flip-2-hor-bottom-1", "flip-2-ver-left-2", "flip-2-ver-left-1" ],
          cycleDelay: 5, // Seconds. Length of one animation cycle.
          covers: 6, // How many covers to animate in one cycle
          randomCovers: true, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'constantly-random',
          description: 'Slow but constant animation with random everything.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: 10, // Seconds. Length of one animation cycle.
          covers: function(covers) { return Math.floor((10 / 100) * covers.total) || 1; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 100, // Cover animation delay is divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'no-chill',
          description: 'Animates all covers all the time.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: function(covers) { return (40 / 100) * covers.total; /* .4s per cover */ }, // Seconds. Length of one animation cycle.
          covers: function(covers) { return covers.total; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 100, // Cover animation delay is calculated divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'some-chill',
          description: 'Animates all covers every 25 seconds using all animations randomly.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: 25, // Seconds. Length of one animation cycle.
          covers: function(covers) { return covers.total; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 70, // Cover animation delay is calculated divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'clear-all',
          description: 'Animates all covers every 15 seconds using "fade-in" animation.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          cycleDelay: 15, // Seconds. Length of one animation cycle.
          covers: function(covers) { return covers.total; }, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 20, // Cover animation delay is calculated divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        }
      ],
    };
  },
};
