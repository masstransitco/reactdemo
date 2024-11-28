export const AppProvider = ({ children }) => {
  const [currentMarkerType, setCurrentMarkerType] = useState("Cars");
  const [selectedStation, setSelectedStation] = useState(null);

  return (
    <AppContext.Provider
      value={{
        currentMarkerType,
        setCurrentMarkerType,
        selectedStation,
        setSelectedStation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
