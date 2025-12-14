import { StandaloneRenderer } from './StandaloneRenderer';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

function App() {
  return (
    <>
      <StandaloneRenderer />
      <Toaster />
    </>
  );
}

export default App;
