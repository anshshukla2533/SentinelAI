import { ConstellationField } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

export function Scene() {
  return (
    <div className="shader-frame">
      <ConstellationField
        variant="gateway-flow"
        mode="dark"
        speed={1.0}
        size={1.0}
        length={1.0}
        density={1.0}
        opacity={1.0}
        hue={0}
        saturation={1.0}
        brightness={1.0}
      />
    </div>
  );
}
