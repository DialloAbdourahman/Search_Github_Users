import React, { useState, useEffect, useContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: '' });

  const toggleError = (show = false, msg = '') => {
    setError({ show, msg });
  };

  // const searchGithubUser = async (user) => {
  //   toggleError();
  //   setLoading(true);
  //   const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
  //     console.log(err)
  //   );
  //   if (response) {
  //     setGithubUser(response.data);
  //     const { followers_url, repos_url } = response.data;

  //     await axios(`${repos_url}?per_page=100`).then((response) =>
  //       setRepos(response.data)
  //     );

  //     await axios(`${followers_url}?per_page=100`).then((response) =>
  //       setFollowers(response.data)
  //     );
  //   } else {
  //     toggleError(true, 'There is no user with that user name');
  //   }
  //   checkRequests();
  //   setLoading(false);
  // };

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    if (response) {
      setGithubUser(response.data);
      const { followers_url, repos_url } = response.data;

      await Promise.allSettled([
        axios(`${repos_url}?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;
          const status = 'fulfilled';
          if (repos.status === status) {
            setRepos(repos.value.data);
          }
          if (followers.status === status) {
            setFollowers(followers.value.data);
          }
        })
        .catch((err) => console.log(err));
    } else {
      toggleError(true, 'There is no user with that user name');
    }
    checkRequests();
    setLoading(false);
  };

  const checkRequests = async () => {
    try {
      const response = await axios(`${rootUrl}/rate_limit`);
      const data = response.data;
      let remaining = data.rate.remaining;
      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, 'sorry you have exceeded your hourly rate limit!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkRequests();
    // eslint-disable-next-line
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(GithubContext);
};

export { GithubProvider, useGlobalContext };
