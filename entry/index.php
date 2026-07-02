<?php
session_name('KEIHIN_ENTRY_FORM');
session_start();

if (empty($_SESSION['entry_form_token'])) {
  $_SESSION['entry_form_token'] = bin2hex(random_bytes(32));
}

$token = $_SESSION['entry_form_token'];
$startedAt = time();
$prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>京浜電設株式会社｜採用エントリーフォーム</title>
  <meta name="description" content="神奈川・横浜で70年以上の歴史と実績を重ね、ますます元気に成長を続ける「京浜電設」の採用にご応募される方は、こちらのエントリーフォームから。" />
  <meta name="robots" content="noindex,nofollow" />
  <meta name="theme-color" content="#005D97" />
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:site_name" content="京浜電設株式会社 採用サイト" />
  <meta property="og:title" content="京浜電設株式会社｜採用エントリーフォーム" />
  <meta property="og:description" content="神奈川・横浜で70年以上の歴史と実績を重ね、ますます元気に成長を続ける「京浜電設」の採用にご応募される方は、こちらのエントリーフォームから。" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="/recruit/entry/" />
  <meta property="og:image" content="/recruit/images/common/header_logo.png" />
  <link rel="icon" type="image/png" href="/recruit/images/common/header_logo.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/recruit/images/common/header_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css?v=20260601">
  <script defer src="https://code.jquery.com/jquery-3.6.0.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script defer src="../js/gsap.js?v=20260525"></script>
  <script defer src="../js/script.js?v=20260601"></script>
</head>

<body>
  <?php include_once(__DIR__ . '/../includes/header.php'); ?>

  <main class="p-entry">
    <section class="p-entry__hero">
      <div class="l-inner">
        <div class="p-entry__heading">
          <p class="p-entry__en">ENTRY FORM</p>
          <h1 class="p-entry__sub">応募フォーム</h1>
        </div>
      </div>
    </section>

    <section class="p-entry__content">
      <div class="l-inner">
        <div class="p-entry__lead">
          <p>応募に必要な個人情報をお預かりいたしますが、その情報は当社の採用活動以外の目的では一切使用いたしません。<br>お預かりした個人情報は厳重に管理し現在お勤めになっている企業様へはもちろん、その他の外部に漏えいすることのないよう細心の注意を払ってお取扱いすることをお約束いたします。<br>詳しくは「プライバシーポリシー」をご覧ください。</p>
          <p>ご応募をご希望の方は、入力欄に必要事項をご記入の上、確認ボタンを押してください。<br>メールをお送りいただきましたら、担当者が内容を確認して折り返しご連絡差し上げます。</p>
        </div>

        <form class="p-entry__form" action="../mail.php" method="post" enctype="multipart/form-data" novalidate>
          <input type="hidden" name="mode" value="confirm">
          <input type="hidden" name="entry_token" value="<?php echo htmlspecialchars($token, ENT_QUOTES, 'UTF-8'); ?>">
          <input type="hidden" name="form_started_at" value="<?php echo htmlspecialchars((string)$startedAt, ENT_QUOTES, 'UTF-8'); ?>">
          <div class="p-entry__honeypot" aria-hidden="true">
            <label>会社URL<input type="text" name="company_url" tabindex="-1" autocomplete="off"></label>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">応募区分<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control p-entry__radio-grid">
              <label><input type="radio" name="job_type" value="新卒採用" required> 新卒採用</label>
              <label><input type="radio" name="job_type" value="キャリア採用（工事事業部）"> キャリア採用（工事事業部）</label>
              <label><input type="radio" name="job_type" value="キャリア採用（営業部）"> キャリア採用（営業部）</label>
              <label><input type="radio" name="job_type" value="キャリア採用（総務部）"> キャリア採用（総務部）</label>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">氏名<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control p-entry__name-grid">
              <input class="p-entry__input" type="text" name="last_name" placeholder="姓" required>
              <input class="p-entry__input" type="text" name="first_name" placeholder="名" required>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">フリガナ<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control p-entry__name-grid">
              <input class="p-entry__input" type="text" name="last_kana" placeholder="セイ" required>
              <input class="p-entry__input" type="text" name="first_kana" placeholder="メイ" required>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">年齢</div>
            <div class="p-entry__control p-entry__age">
              <input class="p-entry__input" type="number" name="age" min="15" max="80" placeholder="30">
              <span>歳</span>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">住所</div>
            <div class="p-entry__control p-entry__address">
              <div class="p-entry__zip">
                <span>〒</span>
                <input class="p-entry__input" type="text" name="zip" inputmode="numeric" placeholder="半角数字">
                <select class="p-entry__select" name="prefecture">
                  <option value="">都道府県 選択...</option>
                  <?php foreach ($prefectures as $prefecture) : ?>
                    <option value="<?php echo htmlspecialchars($prefecture, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($prefecture, ENT_QUOTES, 'UTF-8'); ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <input class="p-entry__input" type="text" name="city" placeholder="市町村（郵便番号入力時に自動入力されます。）">
              <input class="p-entry__input" type="text" name="street" placeholder="丁目番地">
              <input class="p-entry__input" type="text" name="building" placeholder="建物名・号室">
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">TEL<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control">
              <input class="p-entry__input" type="tel" name="tel" placeholder="090-0000-0000" pattern="[0-9\\-]+" required>
              <p class="p-entry__help">※半角数字とハイフン（-）のみ入力できます。</p>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">E-mail<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control">
              <input class="p-entry__input" type="email" name="email" placeholder="半角英数字のみ" required>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">確認用E-mail<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control">
              <input class="p-entry__input" type="email" name="email_confirm" placeholder="半角英数字のみ" required>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">履歴書<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control">
              <div class="p-entry__file-field">
                <input class="p-entry__file js-entry-file" id="entry-resume" type="file" name="resume" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" required>
                <label class="p-entry__file-name" for="entry-resume"><span>ファイル選択‥</span></label>
                <label class="p-entry__file-browse" for="entry-resume">参照</label>
                <button class="p-entry__file-clear js-entry-file-clear" type="button">取消</button>
              </div>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label">職務経歴書<span class="p-entry__required">必須</span></div>
            <div class="p-entry__control">
              <div class="p-entry__file-field">
                <input class="p-entry__file js-entry-file" id="entry-career-file" type="file" name="career_file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" required>
                <label class="p-entry__file-name" for="entry-career-file"><span>ファイル選択‥</span></label>
                <label class="p-entry__file-browse" for="entry-career-file">参照</label>
                <button class="p-entry__file-clear js-entry-file-clear" type="button">取消</button>
              </div>
            </div>
          </div>

          <div class="p-entry__row p-entry__row--textarea">
            <div class="p-entry__label">自由記入欄</div>
            <div class="p-entry__control">
              <textarea class="p-entry__textarea" name="message"></textarea>
            </div>
          </div>

          <div class="p-entry__row">
            <div class="p-entry__label p-entry__label--wide">京浜電設を知ったきっかけ</div>
            <div class="p-entry__control p-entry__trigger">
              <label><input type="radio" name="source" value="ホームページ"> ホームページ</label>
              <label><input type="radio" name="source" value="就活情報サイト"> 就活情報サイト</label>
              <label><input type="radio" name="source" value="口コミサイト"> 口コミサイト</label>
              <label><input type="radio" name="source" value="インスタグラム"> インスタグラム</label>
            </div>
          </div>

          <div class="p-entry__actions">
            <button class="p-entry__button p-entry__button--submit" type="submit">確認用画面へ</button>
            <button class="p-entry__button p-entry__button--reset" type="reset">リセット</button>
          </div>
          <p class="p-entry__form-error js-entry-form-error" role="alert" aria-live="polite" hidden></p>
        </form>

        <p class="p-entry__bottom-note">※フォーム送信後は「メールアドレス」に記入されたメールアドレスに送信確認のメールが届きます。送信確認のメールが届かない場合は、メールアドレスの入力が間違っている場合があります。また、迷惑メールフォルダに入っている場合もありますので、そちらもご確認ください。</p>
      </div>
    </section>
  </main>

  <?php include_once(__DIR__ . '/../includes/footer.php'); ?>
</body>

</html>
