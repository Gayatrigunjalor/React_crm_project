import { useAppContext } from '../providers/AppProvider';
import { useEffect, useState } from 'react';
import is from 'is_js';
import { REFRESH, SET_CONFIG } from '../reducers/ConfigReducer';
import { getSystemTheme } from '../helpers/utils';

const publicUrl = import.meta.env.VITE_PUBLIC_URL;

const useToggleStyle = () => {
    const [isStylesheetLoaded, setIsStylesheetLoaded] = useState(false);
    const {
        config: { theme, isRTL },
        configDispatch
    } = useAppContext();
    const HTMLClassList = document.getElementsByTagName('html')[0].classList;
    useEffect(() => {
        if (is.windows()) {
            HTMLClassList.add('windows');
        }
        if (is.chrome()) {
            HTMLClassList.add('chrome');
        }
        if (is.firefox()) {
            HTMLClassList.add('firefox');
        }
        if (is.safari()) {
            HTMLClassList.add('safari');
        }
        if (is.windows()) {
            HTMLClassList.add('windows');
        }
        if (is.mac()) {
            HTMLClassList.add('osx');
        }
    }, [HTMLClassList]);

    useEffect(() => {
        setIsStylesheetLoaded(false);
        Array.from(document.getElementsByClassName('theme-stylesheet')).forEach(
            link => link.remove()
        );
        const link = document.createElement('link');
        link.href = `${publicUrl}/theme-qehjfEQQ${isRTL ? '.rtl' : ''}.css`;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.className = 'theme-stylesheet';

        const userLink = document.createElement('link');
        userLink.href = `${publicUrl}/user-B_SY1GJM${isRTL ? '.rtl' : ''}.css`;
        userLink.type = 'text/css';
        userLink.rel = 'stylesheet';
        userLink.className = 'theme-stylesheet';

        link.onload = () => {
            setIsStylesheetLoaded(true);
        };

        document.head.appendChild(link);
        document.head.appendChild(userLink);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }, [isRTL]);

    useEffect(() => {
        const mode = theme === 'auto' ? getSystemTheme() : theme;
        configDispatch({
            type: SET_CONFIG,
            payload: {
                isDark: mode === 'dark'
            }
        });
        document.documentElement.setAttribute('data-bs-theme', mode);
        configDispatch({
            type: REFRESH
        });
    }, [theme]);

    return { isStylesheetLoaded };
};

export default useToggleStyle;
