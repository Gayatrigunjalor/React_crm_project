import { PageBreadcrumbItem } from '../components/common/PageBreadcrumb';
import team1 from '../assets/img/team/40x40/1.webp';
import team2 from '../assets/img/team/40x40/2.webp';
import team3 from '../assets/img/team/40x40/3.webp';
export const notificationsBreadcrumbItems: PageBreadcrumbItem[] = [
  {
    label: 'Pages',
    url: '#!'
  },
  {
    label: 'Notifications',
    active: true
  }
];

export interface Notification {
  id: number | string;
  avatar?: string;
  name: string;
  detail?: string;
  interaction: string;
  interactionIcon: string;
  ago: string;
  icon: string;
  time: string;
  date: string;
  read: boolean;
  // avatarPlaceholder?: boolean;
}

export const notifications: Notification[] = [
    {
        id: '1',
        avatar: team1,
        name: 'Jessie Samson',
        interactionIcon: '💬',
        interaction: 'Mentioned you in a comment.',
        detail: ' "Well done! Proud of you ❤️ " ',
        ago: '10m',
        icon: 'clock',
        time: '10:41 AM ',
        date: 'August 7,2021',
        read: true
    },
    {
        id: '3',
        name: 'Jessie Samson',
        interactionIcon: '👍',
        interaction: 'Liked your comment.',
        detail: '"Amazing Works️"',
        ago: '1h',
        icon: 'clock',
        time: '9:30 AM ',
        date: 'August 7,2021',
        read: false
    },
    {
        id: '4',
        avatar: team2,
        name: 'Kiera Anderson',
        interactionIcon: '💬',
        interaction: 'Mentioned you in a comment.',
        detail: '"This is too good to be true!"',
        ago: '',
        icon: 'fas fa-clock',
        time: '9:11 AM ',
        date: 'August 7,2021',
        read: false
    },
    {
        id: '5',
        avatar: team3,
        name: 'Herman Carter',
        interactionIcon: '👤',
        interaction: 'Tagged you in a comment',
        detail: 'post',
        ago: '',
        icon: 'fas fa-clock',
        time: '10:58 PM ',
        date: 'August 7,2021',
        read: false
    }
];
