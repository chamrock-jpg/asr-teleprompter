import { useSettingsStore } from '@/store/settingsStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const display = useSettingsStore((s) => s.display);
  const updateDisplay = useSettingsStore((s) => s.updateDisplay);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '320px',
        backgroundColor: '#1a1a2e',
        borderLeft: '1px solid #333',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px' }}>Settings</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          x
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Font Size */}
        <label style={labelStyle}>
          Font Size: {display.fontSize}px
          <input
            type="range"
            min={24}
            max={120}
            value={display.fontSize}
            onChange={(e) => updateDisplay({ fontSize: Number(e.target.value) })}
            style={rangeStyle}
          />
        </label>

        {/* Line Height */}
        <label style={labelStyle}>
          Line Height: {display.lineHeight.toFixed(1)}
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={display.lineHeight}
            onChange={(e) => updateDisplay({ lineHeight: Number(e.target.value) })}
            style={rangeStyle}
          />
        </label>

        {/* Margin */}
        <label style={labelStyle}>
          Margin: {display.marginPercent}%
          <input
            type="range"
            min={0}
            max={30}
            value={display.marginPercent}
            onChange={(e) => updateDisplay({ marginPercent: Number(e.target.value) })}
            style={rangeStyle}
          />
        </label>

        {/* Text Color */}
        <label style={labelStyle}>
          Text Color
          <input
            type="color"
            value={display.textColor}
            onChange={(e) => updateDisplay({ textColor: e.target.value })}
            style={{ width: '100%', height: '36px', cursor: 'pointer' }}
          />
        </label>

        {/* Background Color */}
        <label style={labelStyle}>
          Background Color
          <input
            type="color"
            value={display.backgroundColor}
            onChange={(e) => updateDisplay({ backgroundColor: e.target.value })}
            style={{ width: '100%', height: '36px', cursor: 'pointer' }}
          />
        </label>

        {/* Highlight Color */}
        <label style={labelStyle}>
          Highlight Color
          <input
            type="color"
            value={display.highlightColor}
            onChange={(e) => updateDisplay({ highlightColor: e.target.value })}
            style={{ width: '100%', height: '36px', cursor: 'pointer' }}
          />
        </label>

        {/* Mirror Mode */}
        <label
          style={{
            ...labelStyle,
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <input
            type="checkbox"
            checked={display.isMirrored}
            onChange={(e) => updateDisplay({ isMirrored: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          Mirror Mode (for physical teleprompter)
        </label>

        {/* Font Family */}
        <label style={labelStyle}>
          Font Family
          <select
            value={display.fontFamily}
            onChange={(e) => updateDisplay({ fontFamily: e.target.value })}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #555',
              backgroundColor: '#0f0f23',
              color: '#e0e0e0',
              fontSize: '14px',
            }}
          >
            <option value="system-ui, sans-serif">System UI</option>
            <option value="'Noto Sans SC', sans-serif">Noto Sans SC</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </label>

        {/* Scroll Speed */}
        <label style={labelStyle}>
          Scroll Speed: {display.scrollSpeed}
          <input
            type="range"
            min={1}
            max={10}
            value={display.scrollSpeed}
            onChange={(e) => updateDisplay({ scrollSpeed: Number(e.target.value) })}
            style={rangeStyle}
          />
        </label>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '14px',
  color: '#ccc',
};

const rangeStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  accentColor: '#fbbf24',
};
