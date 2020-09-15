/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Pressable, View, StatusBar, Text, Animated} from 'react-native';
import Config from './config';

// Default optimised settings which build the distance between the items
const INITIAL_TOP = 15;
const OFFSET = 50;

/**
 * Minimal distance between reel & number = 50 px
 */

const App: () => React$Node = () => {
  function generateNumber() {
    return Math.floor(Math.random() * 10);
  }

  function calculateTop(index) {
    return INITIAL_TOP -(index * OFFSET);
  }

  function generateSpinAnimationForReel(reel, reelIndex) {
    let animationArray = [];
    reel.renderedNumbers.forEach((renderedNumber) => {
      animationArray.push(Animated.decay(renderedNumber.top, {
        velocity: 1, // + (reelIndex * 0.1)
        deceleration: 0.999005,
        useNativeDriver: true
      }))
    });
    return animationArray;
  }

  function resetPositions() {
    reelData.forEach((reel) => {
      resetPositionForReel(reel);
    })
  }

  function resetPositionForReel(reel) {
    reel.renderedNumbers.forEach((renderedNumber, index) => {
      renderedNumber.top.setValue(calculateTop(index))
    });
  }

  function runInfiniteSpin() {
    let animationArray = [];
    reelData.forEach((reel, reelIndex) => {
      reel.renderedNumbers.forEach((renderedNumber) => {
        let _animation = Animated.decay(renderedNumber.top, {
          velocity: 1, // + (reelIndex * 0.1)
          deceleration: 0.99999,
          useNativeDriver: true
        });
        animationArray.push({animation: _animation, reelIndex});
      });
    });

    let animation = Animated.parallel(animationArray.map(anim => anim.animation));
    animation.start();
    let interval = setInterval(() => {
      animation.stop();
      animation.reset();
      animationArray.forEach((anim) => {
        const reel = reelData[anim.reelIndex];
        resetPositionForReel(reel);
      });
      animation.start();
    }, 300);

    setTimeout(() => {
      reelData.forEach((reel, reelIndex) => {
        setTimeout(() => {
          animationArray = animationArray.filter(x => x.reelIndex !== reelIndex);
          if (animationArray.length === 0) {
            animation.stop();
            clearInterval(interval);
          }
          else {
            animation.stop();
            animation.reset();
            animation = Animated.parallel(animationArray.map(anim => anim.animation));
            animation.start();
          }
          resetPositionForReel(reel);
          runSlowdownAnimation(reel);
        }, reelIndex * Config.spinDifferenceTime);
      });
    }, Config.spinTime);
  }

  function runSlowdownAnimation(reel) {
    let animation = generateSpinAnimationForReel(reel, 0);
    Animated.parallel(animation).start();
  }

  /*
    A SMALL WARNING; MAKE SURE THAT WHEN YOU INTEGRATE YOU DON'T RUN SetupReels & runInfiniteSpin TWICE BECAUSE IT WILL CRASH THE FLOW
    CREATE A BLOCKER AND/OR CANCEL THE EXISTING runTiming & animations
   */
  const onPressSpin = () => {
    setupReels();
    runInfiniteSpin();
  };

  const generateReels = () => {
    let reelArray = [];
    for (let reelIndex = 0; reelIndex < Config.reelCount; reelIndex++) {
      reelArray.push({
        desiredResult: Config.result[reelIndex],
        renderedNumbers: generateInitialRender(reelIndex)
      })
    }
    return reelArray;
  };

  const setupReels = () => {
    reelData.forEach((reel, index) => {
      let previousTop = reel.renderedNumbers[Config.preloadedNumbers[index]];

      reel.renderedNumbers.forEach((number, index) => {
          number.top.setValue(calculateTop(index));
          number.value = generateNumber()
      });

      reel.renderedNumbers[0].value = previousTop.value;
      reel.renderedNumbers[Config.preloadedNumbers[index]].value = Config.result[index];
    });
    setReelData([...reelData]);
  };

  const generateInitialRender = (reelIndex) => {
    let resultArray = [];
    for (let numberIndex = 0; numberIndex <= Config.preloadedNumbers[reelIndex]; numberIndex++) {
       resultArray.push({top: new Animated.Value(calculateTop(numberIndex)), value: generateNumber()})
    }
    return resultArray;
  };

  const [reelData, setReelData] = useState(generateReels());

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <View style={styles.container}>
          { reelData.map((reel, index) => {
            return <View key={`reel-${index}`} style={styles.reelContainer}>
              { reel.renderedNumbers.map((number, index) => {
                return <Animated.Text key={`reel-entry-${index}`} style={[styles.reelContent, {transform: [{translateY: number.top}]}]}>{number.value}</Animated.Text>
              })}
            </View>
          }) }
        </View>
        <Pressable style={styles.buttonContainer} onPress={onPressSpin}>
          <Text style={styles.buttonText}>Spin</Text>
        </Pressable>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: 'red',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'yellow',
    height: 70,
    width: '60%',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  reelContainer: {
    flex: 4,
    height: 70,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: 'yellow',
    alignItems: 'center',
  },
  reelContent: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
    color: 'yellow',
  },
  buttonContainer: {
    width: '60%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'darkgreen',
  },
  buttonText: {
    color: "white",
    marginVertical: 20,
    fontWeight: "600"
  },
});

export default App;
