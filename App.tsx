import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Main from './navigators/Main';
import Auth from './navigators/Auth';
import {Provider, useSelector} from 'react-redux';
import Store from './redux/Store';
import {useLoadUserQuery} from './redux/features/api/apiSlice';
import {StatusBar} from 'react-native';
import Loader from './src/common/Loader';
import {LogBox} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
LogBox.ignoreAllLogs();

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider store={Store}>
      <AppStack />
    </Provider>
  );
};

const AppStack = () => {
  const {user} = useSelector((state: any) => state.auth);
  const {isLoading} = useLoadUserQuery({}, {});

  return (
    <>
      <>
        <StatusBar animated={true} backgroundColor={'black'} />
      </>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {user ? (
            <NavigationContainer>
              <Main />
            </NavigationContainer>
          ) : (
            <NavigationContainer>
              <Auth />
            </NavigationContainer>
          )}
        </>
      )}
    </>
  );
};

export default App;
