import React, { createContext, useContext, useState, ReactNode } from 'react';

const resources: Record<string, Record<string, string>> = {
  en: {
    portal: 'Portal',
    workbench: 'Workbench',
    approvals: 'Approvals',
    apps: 'Apps',
    reports: 'Reports',
    sysMgmt: 'System Management',
    helpCenter: 'Help Center',
    notification: 'Notifications',
    refresh: 'Refresh',
    home: 'Home',
    logout: 'Logout',
    welcome: 'Good afternoon',
    admin: 'Administrator',
    notices: 'Notices',
    new: 'NEW',
    submit: 'Submit',
    saveDraft: 'Save Draft',
    submitAndContinue: 'Submit & Continue',
  },
  zh: {
    portal: '门户首页',
    workbench: '门户首页',
    approvals: '流程待办',
    apps: '单据申请',
    reports: '报表中心',
    sysMgmt: '系统管理',
    helpCenter: '帮助中心',
    notification: '通知公告',
    refresh: '刷新页面',
    home: '返回首页',
    logout: '退出登录',
    welcome: '下午好',
    admin: '管理员',
    notices: '新闻公告',
    new: 'NEW',
    submit: '提交',
    saveDraft: '存草稿',
    submitAndContinue: '提交并继续创建',
  },
};

type I18nContextValue = {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh',
  setLocale: () => {},
  t: (k) => k,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<string>(() => {
    try {
      return (localStorage.getItem('locale') as string) || 'zh';
    } catch {
      return 'zh';
    }
  });

  const t = (key: string) => {
    return resources[locale]?.[key] ?? resources['zh']?.[key] ?? key;
  };

  const setLocaleAndPersist = (l: string) => {
    setLocale(l);
    try { localStorage.setItem('locale', l); } catch {}
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: setLocaleAndPersist, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export default resources;
