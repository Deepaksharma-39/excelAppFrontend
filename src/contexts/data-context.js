import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const DATA_HANDLERS = {
  FETCH_DATA_SUCCESS: 'FETCH_DATA_SUCCESS',
  FETCH_DATA_FAILURE: 'FETCH_DATA_FAILURE'
};

const initialDataState = {
  data: null,
  error: null,
  isLoading: true
};

const dataHandlers = {
  [DATA_HANDLERS.FETCH_DATA_SUCCESS]: (state, action) => ({
    ...state,
    data: action.payload,
    isLoading: false,
    error: null
  }),
  [DATA_HANDLERS.FETCH_DATA_FAILURE]: (state, action) => ({
    ...state,
    isLoading: false,
    error: action.payload
  })
};

const dataReducer = (state, action) =>
  dataHandlers[action.type] ? dataHandlers[action.type](state, action) : state;

export const DataContext = createContext({ undefined });

export const DataProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(dataReducer, initialDataState);
  const initialized = useRef(false);

  const fetchData = async () => {
    try {
      // Make API request to fetch data
      const result = (
        await axios.get('https://excelappbackend.onrender.com/api/read')
      ).data;

      // Update the local state with fetched data
      dispatch({
        type: DATA_HANDLERS.FETCH_DATA_SUCCESS,
        payload: result
      });
    } catch (error) {
      // If the API request was not successful, handle the error
      dispatch({
        type: DATA_HANDLERS.FETCH_DATA_FAILURE,
        payload: error.message
      });
    }
  };

  useEffect(() => {
    // Fetch data on component mount
    if (!initialized.current) {
      fetchData();
      initialized.current = true;
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...state,
        fetchData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node
};

export const DataConsumer = DataContext.Consumer;

export const useDataContext = () => useContext(DataContext);
