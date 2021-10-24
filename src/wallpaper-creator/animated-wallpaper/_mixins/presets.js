export default {
  data: function() {
    return {
      presets: [
        {
          name: 'all-animations-random',
          description: '...',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: false, // Falsy value = all animations.
          cycleDelay: 10, // Seconds. Length of one animation cycle.
          covers: 3, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'sliding-around-randomly',
          description: 'Animates one cover at a time sequentially.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['push-left', 'push-right','push-up','push-down','squish-left','squish-right','squish-up','squish-down',], // Falsy value = all animations.
          covers: 3, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 7, // Seconds. Length of one animation cycle.
          animationZone: 60, // Cover animation delay is divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'piano-key-swipe',
          description: 'Animates one row at a time time.',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          covers: 'one-row', // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 11, // Seconds. Length of one animation cycle.
          animationZone: 8, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'row-switcheroo',
          description: 'Animates one row at a time time.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          covers: 'one-row', // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          cycleDelay: 11, // Seconds. Length of one animation cycle.
          animationZone: 0, // Cover animation delay is divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        },
        {
          name: 'random-simple-flips',
          description: 'Randomly animates 1-6 covers every 5 seconds.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          //use: ['flip-horizontal-bottom', 'flip-horizontal-top', 'flip-vertical-right', 'flip-vertical-left', 'flip-diagonal-2-tl', 'flip-diagonal-2-br', 'flip-diagonal-1-bl', 'flip-diagonal-1-tr' ], // Falsy value = all animations.
          use: [ "flip-2-hor-top-2", "flip-2-ver-right-2", "flip-2-hor-bottom-2", "flip-2-ver-left-2" ],
          cycleDelay: 10, // Seconds. Length of one animation cycle.
          covers: 3, // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 50, // Cover animation delay is divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'raindrops',
          description: '...',
          onLoad: true, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in-top'], // Falsy value = all animations.
          cycleDelay: 20, // Seconds. Length of one animation cycle.
          covers: 'all', // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 30, // Cover animation delay is divided equally within this animation zone.
          randomDelay: true, // Animations are triggered randomly within the "animationZone" 
          sequential: false, // Covers are animated: left to right / top down
        },
        {
          name: 'clear-all',
          description: 'Animates all covers every 15 seconds using "fade-in" animation.',
          onLoad: false, // Animates immediately on load. Otherwise it waits for "cycleDelay" to finish before starting.
          use: ['fade-in'], // Falsy value = all animations.
          cycleDelay: 15, // Seconds. Length of one animation cycle.
          covers: 'all', // How many covers to animate in one cycle
          randomCovers: false, // If enabled, random amount of covers are animated each cycle. Minimum is 1 and max is "covers" amount.
          animationZone: 20, // Cover animation delay is calculated divided equally within this animation zone.
          randomDelay: false, // Animations are triggered randomly within the "animationZone" 
          sequential: true, // Covers are animated: left to right / top down
        }
      ],
    };
  },
};
