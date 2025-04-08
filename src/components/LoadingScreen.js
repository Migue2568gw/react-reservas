import caramel from "../assets/images/caramel.png"; 

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <img src={caramel} alt="Logo de la barbería" className="loading-logo" />
    </div>
  );
};

export default LoadingScreen;
