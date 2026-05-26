import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { formatShortMonth } from '@/types';

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  if (Math.abs(end - start) >= 359.9) {
    // Full circle
    const o1 = { x: cx, y: cy - outerR };
    const o2 = { x: cx + 0.01, y: cy - outerR };
    return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 1 1 ${o2.x} ${o2.y} Z`;
  }
  const o1 = polarToCartesian(cx, cy, outerR, start);
  const o2 = polarToCartesian(cx, cy, outerR, end);
  const i1 = polarToCartesian(cx, cy, innerR, end);
  const i2 = polarToCartesian(cx, cy, innerR, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function DonutChart({ data, size = 180 }: { data: DonutSlice[]; size?: number }) {
  const { colors } = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.62;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Path
          d={slicePath(cx, cy, outerR, innerR, 0, 359.9)}
          fill={colors.muted}
        />
      </Svg>
    );
  }

  let currentAngle = 0;
  const slices = data.slice(0, 8).map(d => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...d, path: slicePath(cx, cy, outerR, innerR, startAngle, currentAngle - 0.3) };
  });

  return (
    <Svg width={size} height={size}>
      <G>
        {slices.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} />
        ))}
      </G>
    </Svg>
  );
}

interface BarData {
  month: string;
  income: number;
  expense: number;
}

export function BarChart({ data, width = 320, height = 180 }: { data: BarData[]; width?: number; height?: number }) {
  const { colors } = useTheme();
  const paddingL = 8;
  const paddingR = 8;
  const paddingT = 10;
  const paddingB = 28;
  const chartW = width - paddingL - paddingR;
  const chartH = height - paddingT - paddingB;
  const count = data.length;
  const groupW = chartW / count;
  const barW = Math.min(groupW * 0.28, 14);
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

  return (
    <Svg width={width} height={height}>
      {data.map((d, i) => {
        const cx = paddingL + i * groupW + groupW / 2;
        const incH = Math.max((d.income / maxVal) * chartH, 2);
        const expH = Math.max((d.expense / maxVal) * chartH, 2);
        const shortMonth = formatShortMonth(d.month);
        return (
          <G key={i}>
            <Rect
              x={cx - barW - 2}
              y={paddingT + chartH - incH}
              width={barW}
              height={incH}
              fill={colors.income}
              rx={4}
            />
            <Rect
              x={cx + 2}
              y={paddingT + chartH - expH}
              width={barW}
              height={expH}
              fill={colors.expense}
              rx={4}
            />
            <SvgText
              x={cx}
              y={height - 8}
              fontSize={10}
              fill={colors.mutedForeground}
              textAnchor="middle"
              fontFamily="Inter_400Regular"
            >
              {shortMonth}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function ChartLegend({ items }: { items: { color: string; label: string; value: string }[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legend}>
      {items.map((item, i) => (
        <View key={i} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {item.label}
          </Text>
          <Text style={[styles.legendValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    gap: 8,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
  },
  legendValue: {
    fontSize: 13,
  },
});
