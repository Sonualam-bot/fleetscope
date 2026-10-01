import MapView from './map/MapView'
import { useFleetSimulation } from './telemetry/useFleetSimulation'

function App() {
  useFleetSimulation()
  return <MapView />
}

export default App
