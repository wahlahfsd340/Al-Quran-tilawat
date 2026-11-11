import { useLang } from '../i18n.jsx';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="credit">
      <div className="credit-grid">
        <div className="credit-left">
          <p className="credit-line">{t('dev_by')}</p>
          <p className="credit-name" dir="ltr">WASIF WAHLAH</p>
          <p className="credit-item"><span>{t('contact')}</span><a href="tel:03001551340" dir="ltr">03001551340</a></p>
          <p className="credit-item"><span>{t('gmail')}</span><a href="mailto:wahlahfsd340@gmail.com" dir="ltr">wahlahfsd340@gmail.com</a></p>
        </div>
      </div>
    </footer>
  );
}
