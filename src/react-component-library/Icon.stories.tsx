import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { ICONS } from './icons';
import styles from './Icon.stories.module.css';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'zoom-in' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {
  render: () => (
    <div className={styles.catalogue}>
      {(Object.keys(ICONS) as IconName[]).map((name) => (
        <div className={styles.icon} key={name}>
          <Icon name={name} size="l" />
          <span>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Default: Story = {};
export const PresetSize: Story = { args: { size: 'xl' } };
export const CustomSize: Story = { args: { size: 48 } };
export const Color: Story = { args: { color: '#63f8ff', size: 'xl' } };
export const AccessibleLabel: Story = { args: { title: 'Zoom in' } };
