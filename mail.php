<?php
session_name('KEIHIN_ENTRY_FORM');
session_start();

mb_language('Japanese');
mb_internal_encoding('UTF-8');

$adminTo = getenv('ENTRY_MAIL_TO') ?: 'firststep.yumauda@gmail.com';
$fromAddress = getenv('ENTRY_MAIL_FROM') ?: 'info@kdcg.co.jp';
$entryUrl = '/recruit/entry/';
$tmpDir = __DIR__ . '/tmp';

$fields = [
  'job_type' => '応募区分',
  'last_name' => '姓',
  'first_name' => '名',
  'last_kana' => 'セイ',
  'first_kana' => 'メイ',
  'age' => '年齢',
  'zip' => '郵便番号',
  'prefecture' => '都道府県',
  'city' => '市町村',
  'street' => '丁目番地',
  'building' => '建物名・号室',
  'tel' => 'TEL',
  'email' => 'E-mail',
  'email_confirm' => '確認用E-mail',
  'message' => '自由記入欄',
  'source' => '京浜電設を知ったきっかけ',
];

$required = ['job_type', 'last_name', 'first_name', 'last_kana', 'first_kana', 'tel', 'email', 'email_confirm'];
$fileFields = [
  'resume' => '履歴書',
  'career_file' => '職務経歴書',
];

function h($value)
{
  return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function requestValue($key)
{
  return isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
}

function sameOriginReferer($requireEntryPage = false)
{
  if (empty($_SERVER['HTTP_REFERER']) || empty($_SERVER['HTTP_HOST'])) {
    return false;
  }

  $referer = parse_url($_SERVER['HTTP_REFERER']);
  if (empty($referer['host'])) {
    return false;
  }

  $refererHost = $referer['host'] . (isset($referer['port']) ? ':' . $referer['port'] : '');
  if (strcasecmp($refererHost, $_SERVER['HTTP_HOST']) !== 0) {
    return false;
  }

  if ($requireEntryPage) {
    $path = $referer['path'] ?? '';
    return strpos($path, '/entry/') !== false || strpos($path, '/recruit/entry/') !== false;
  }

  return true;
}

function validToken()
{
  return !empty($_POST['entry_token'])
    && !empty($_SESSION['entry_form_token'])
    && hash_equals($_SESSION['entry_form_token'], (string)$_POST['entry_token']);
}

function spamErrors()
{
  $errors = [];

  if (requestValue('company_url') !== '') {
    $errors[] = '送信内容を受け付けできませんでした。';
  }

  $startedAt = (int)requestValue('form_started_at');
  if ($startedAt > 0 && time() - $startedAt < 3) {
    $errors[] = '送信までの時間が短すぎます。入力内容をご確認ください。';
  }

  $message = requestValue('message');
  if (preg_match_all('/https?:\\/\\//i', $message) > 2 || preg_match('/<\\s*(a|script|iframe|object|embed)\\b/i', $message)) {
    $errors[] = '自由記入欄に使用できない内容が含まれています。';
  }

  if (!empty($_SESSION['entry_last_send']) && time() - (int)$_SESSION['entry_last_send'] < 20) {
    $errors[] = '連続送信はできません。しばらく時間をおいてからお試しください。';
  }

  return $errors;
}

function validateInput($required)
{
  $errors = [];

  foreach ($required as $key) {
    if (requestValue($key) === '') {
      $errors[] = '必須項目が未入力です。';
      break;
    }
  }

  $email = requestValue('email');
  if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'E-mailの形式が正しくありません。';
  }

  if ($email !== requestValue('email_confirm')) {
    $errors[] = 'E-mailと確認用E-mailが一致していません。';
  }

  $tel = requestValue('tel');
  if ($tel !== '' && !preg_match('/\\A[0-9\\-]+\\z/', $tel)) {
    $errors[] = 'TELは半角数字とハイフンのみで入力してください。';
  }

  foreach (['last_kana', 'first_kana'] as $key) {
    $kana = requestValue($key);
    if ($kana !== '' && !preg_match('/\\A[ァ-ヶー・　\\s]+\\z/u', $kana)) {
      $errors[] = 'フリガナは全角カタカナで入力してください。';
      break;
    }
  }

  $age = requestValue('age');
  if ($age !== '' && (!ctype_digit($age) || (int)$age < 15 || (int)$age > 80)) {
    $errors[] = '年齢は15から80までの半角数字で入力してください。';
  }

  return $errors;
}

function saveUpload($field, $label, $tmpDir)
{
  if (empty($_FILES[$field]) || !isset($_FILES[$field]['error'])) {
    return [null, "{$label}を選択してください。"];
  }

  $file = $_FILES[$field];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    return [null, "{$label}を選択してください。"];
  }

  if ($file['size'] > 5 * 1024 * 1024) {
    return [null, "{$label}は5MB以内のファイルを選択してください。"];
  }

  $original = basename((string)$file['name']);
  $extension = strtolower(pathinfo($original, PATHINFO_EXTENSION));
  $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
  if (!in_array($extension, $allowed, true)) {
    return [null, "{$label}はPDF、Word、Excel、JPG、PNG形式でアップロードしてください。"];
  }

  if (!is_dir($tmpDir)) {
    mkdir($tmpDir, 0755, true);
  }

  $safeName = bin2hex(random_bytes(16)) . '_' . $field . '.' . $extension;
  $destination = $tmpDir . '/' . $safeName;
  if (!move_uploaded_file($file['tmp_name'], $destination)) {
    return [null, "{$label}のアップロードに失敗しました。"];
  }

  return [[
    'path' => $destination,
    'name' => $original,
    'type' => mime_content_type($destination) ?: 'application/octet-stream',
  ], null];
}

function collectPostedData($fields)
{
  $data = [];
  foreach ($fields as $key => $label) {
    $data[$key] = requestValue($key);
  }
  return $data;
}

function renderHead($title)
{
  ?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title><?php echo h($title); ?> | 京浜電設株式会社 採用サイト</title>
  <meta name="description" content="京浜電設株式会社 採用サイトの応募フォームです。" />
  <meta name="robots" content="noindex,nofollow" />
  <meta name="theme-color" content="#005D97" />
  <link rel="icon" type="image/png" href="/recruit/images/common/header_logo.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/recruit/images/common/header_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css?v=20260527">
  <script defer src="https://code.jquery.com/jquery-3.6.0.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script defer src="js/gsap.js?v=20260525"></script>
  <script defer src="js/script.js?v=20260525"></script>
</head>

<body>
<?php include_once(__DIR__ . '/includes/header.php'); ?>
<?php
}

function renderFoot()
{
  include_once(__DIR__ . '/includes/footer.php');
  echo "</body>\n</html>\n";
}

function renderEntryHero($heading)
{
  ?>
  <main class="p-entry">
    <section class="p-entry__hero">
      <div class="l-inner">
        <div class="p-entry__heading">
          <p class="p-entry__en">ENTRY FORM</p>
          <h1 class="p-entry__sub"><?php echo h($heading); ?></h1>
        </div>
      </div>
    </section>
<?php
}

function renderErrors($errors)
{
  if (!$errors) {
    return;
  }
  echo '<div class="p-entry__error"><ul>';
  foreach (array_unique($errors) as $error) {
    echo '<li>' . h($error) . '</li>';
  }
  echo '</ul></div>';
}

function renderErrorPage($errors, $entryUrl)
{
  renderHead('応募フォーム エラー');
  renderEntryHero('応募フォーム');
  ?>
    <section class="p-entry__content">
      <div class="l-inner">
        <?php renderErrors($errors); ?>
        <div class="p-entry__actions">
          <a class="p-entry__button p-entry__button--link" href="<?php echo h($entryUrl); ?>">入力画面へ戻る</a>
        </div>
      </div>
    </section>
  </main>
  <?php
  renderFoot();
}

function renderConfirm($data, $fields, $uploads)
{
  renderHead('応募フォーム 確認');
  renderEntryHero('応募フォーム 確認');
  ?>
    <section class="p-entry__content">
      <div class="l-inner">
        <p class="p-entry__message">入力内容をご確認のうえ、問題がなければ送信ボタンを押してください。</p>
        <div class="p-entry__confirm">
          <table class="p-entry__confirm-table">
            <tbody>
              <tr><th>氏名</th><td><?php echo h($data['last_name'] . ' ' . $data['first_name']); ?></td></tr>
              <tr><th>フリガナ</th><td><?php echo h($data['last_kana'] . ' ' . $data['first_kana']); ?></td></tr>
              <?php foreach ($fields as $key => $label) : ?>
                <?php if (in_array($key, ['last_name', 'first_name', 'last_kana', 'first_kana', 'email_confirm'], true)) continue; ?>
                <tr><th><?php echo h($label); ?></th><td><?php echo nl2br(h($data[$key])); ?></td></tr>
              <?php endforeach; ?>
              <?php foreach ($uploads as $key => $file) : ?>
                <tr><th><?php echo h($GLOBALS['fileFields'][$key]); ?></th><td><?php echo h($file['name']); ?></td></tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>

        <form class="p-entry__confirm-form" action="mail.php" method="post">
          <input type="hidden" name="mode" value="send">
          <input type="hidden" name="entry_token" value="<?php echo h($_POST['entry_token'] ?? ''); ?>">
          <?php foreach ($data as $key => $value) : ?>
            <input type="hidden" name="<?php echo h($key); ?>" value="<?php echo h($value); ?>">
          <?php endforeach; ?>
          <?php foreach ($uploads as $key => $file) : ?>
            <input type="hidden" name="<?php echo h($key); ?>_tmp" value="<?php echo h($file['path']); ?>">
            <input type="hidden" name="<?php echo h($key); ?>_name" value="<?php echo h($file['name']); ?>">
            <input type="hidden" name="<?php echo h($key); ?>_type" value="<?php echo h($file['type']); ?>">
          <?php endforeach; ?>
          <div class="p-entry__actions">
            <button class="p-entry__button p-entry__button--submit" type="submit">送信する</button>
            <button class="p-entry__button p-entry__button--back" type="button" onclick="history.back();">戻る</button>
          </div>
        </form>
      </div>
    </section>
  </main>
  <?php
  renderFoot();
}

function buildBody($data, $fields)
{
  $lines = [];
  $lines[] = "京浜電設 採用サイトより応募がありました。";
  $lines[] = "";
  $lines[] = "----------------------------------------";
  $lines[] = "応募内容";
  $lines[] = "----------------------------------------";
  $lines[] = "氏名: " . $data['last_name'] . ' ' . $data['first_name'];
  $lines[] = "フリガナ: " . $data['last_kana'] . ' ' . $data['first_kana'];

  foreach ($fields as $key => $label) {
    if (in_array($key, ['last_name', 'first_name', 'last_kana', 'first_kana', 'email_confirm'], true)) {
      continue;
    }
    $lines[] = $label . ': ' . ($data[$key] ?? '');
  }

  return implode("\n", $lines) . "\n";
}

function sendMultipartMail($to, $subject, $body, $from, $replyTo, $attachments)
{
  $boundary = 'entry_' . bin2hex(random_bytes(16));
  $encodedSubject = mb_encode_mimeheader($subject, 'ISO-2022-JP');
  $encodedBody = mb_convert_encoding($body, 'ISO-2022-JP', 'UTF-8');
  $headers = [];
  $headers[] = 'From: ' . $from;
  if (filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $replyTo;
  }
  $headers[] = 'MIME-Version: 1.0';
  $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

  $message = "--{$boundary}\n";
  $message .= "Content-Type: text/plain; charset=ISO-2022-JP\n";
  $message .= "Content-Transfer-Encoding: 7bit\n\n";
  $message .= $encodedBody . "\n";

  foreach ($attachments as $file) {
    $content = chunk_split(base64_encode(file_get_contents($file['path'])));
    $encodedName = mb_encode_mimeheader($file['name'], 'ISO-2022-JP');
    $message .= "--{$boundary}\n";
    $message .= 'Content-Type: ' . $file['type'] . '; name="' . $encodedName . "\"\n";
    $message .= "Content-Transfer-Encoding: base64\n";
    $message .= 'Content-Disposition: attachment; filename="' . $encodedName . "\"\n\n";
    $message .= $content . "\n";
  }

  $message .= "--{$boundary}--";

  return mail($to, $encodedSubject, $message, implode("\n", $headers));
}

function sendReceiptMail($to, $from, $data, $fields)
{
  if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    return false;
  }

  $name = trim($data['last_name'] . ' ' . $data['first_name']);
  $subject = '【京浜電設株式会社】ご応募を受け付けました';
  $body = $name . " 様\n\n";
  $body .= "この度は京浜電設株式会社の採用サイトよりご応募いただき、誠にありがとうございます。\n";
  $body .= "以下の内容で応募を受け付けました。\n\n";
  $body .= "お送りいただいた内容を確認のうえ、採用担当者より順次ご連絡いたします。\n";
  $body .= "内容によってはご返信までにお時間をいただく場合がございますので、あらかじめご了承ください。\n\n";
  $body .= "----------------------------------------\n";
  $body .= "受付内容\n";
  $body .= "----------------------------------------\n";
  $body .= "氏名: " . $name . "\n";
  $body .= "フリガナ: " . trim(($data['last_kana'] ?? '') . ' ' . ($data['first_kana'] ?? '')) . "\n";

  foreach ($fields as $key => $label) {
    if (in_array($key, ['last_name', 'first_name', 'last_kana', 'first_kana', 'email_confirm'], true)) {
      continue;
    }
    $body .= $label . ': ' . ($data[$key] ?? '') . "\n";
  }

  $body .= "\n";
  $body .= "----------------------------------------\n";
  $body .= "京浜電設株式会社 採用担当\n";
  $body .= "----------------------------------------\n\n";
  $body .= "※このメールは送信専用の自動返信メールです。\n";
  $body .= "※本メールにお心当たりがない場合は、お手数ですが破棄してください。\n";
  $encodedSubject = mb_encode_mimeheader($subject, 'ISO-2022-JP');
  $encodedBody = mb_convert_encoding($body, 'ISO-2022-JP', 'UTF-8');

  $headers = [];
  $headers[] = 'From: ' . $from;
  $headers[] = 'MIME-Version: 1.0';
  $headers[] = 'Content-Type: text/plain; charset=ISO-2022-JP';
  $headers[] = 'Content-Transfer-Encoding: 7bit';

  return mail($to, $encodedSubject, $encodedBody, implode("\n", $headers));
}

function cleanTempFiles($attachments)
{
  foreach ($attachments as $file) {
    if (!empty($file['path']) && is_file($file['path'])) {
      unlink($file['path']);
    }
  }
}

function validateTempAttachment($key, $label, $tmpDir)
{
  $path = requestValue($key . '_tmp');
  $name = requestValue($key . '_name');
  $type = requestValue($key . '_type') ?: 'application/octet-stream';
  $realTmp = realpath($tmpDir);
  $realPath = $path ? realpath($path) : false;

  if (!$realTmp || !$realPath || strpos($realPath, $realTmp) !== 0 || !is_file($realPath)) {
    return [null, "{$label}の一時ファイルを確認できませんでした。再度入力してください。"];
  }

  return [[
    'path' => $realPath,
    'name' => $name ?: basename($realPath),
    'type' => $type,
  ], null];
}

function renderThanks()
{
  renderHead('応募フォーム 完了');
  renderEntryHero('応募フォーム 完了');
  ?>
    <section class="p-entry__content">
      <div class="l-inner">
        <p class="p-entry__message">ご応募ありがとうございました。<br>送信内容を確認のうえ、担当者より折り返しご連絡いたします。</p>
        <div class="p-entry__actions">
          <a class="p-entry__button p-entry__button--link" href="/recruit/">トップへ戻る</a>
        </div>
      </div>
    </section>
  </main>
  <?php
  renderFoot();
}

$mode = requestValue('mode');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !in_array($mode, ['confirm', 'send'], true)) {
  header('Location: ' . $entryUrl);
  exit;
}

if (!sameOriginReferer($mode === 'confirm')) {
  renderErrorPage(['不正なページ遷移です。応募フォームから再度入力してください。'], $entryUrl);
  exit;
}

if (!validToken()) {
  renderErrorPage(['セッションの有効期限が切れました。応募フォームから再度入力してください。'], $entryUrl);
  exit;
}

$data = collectPostedData($fields);
$errors = array_merge(validateInput($required), spamErrors());

if ($mode === 'confirm') {
  $uploads = [];
  foreach ($fileFields as $key => $label) {
    [$file, $error] = saveUpload($key, $label, $tmpDir);
    if ($error) {
      $errors[] = $error;
    } else {
      $uploads[$key] = $file;
    }
  }

  if ($errors) {
    cleanTempFiles($uploads);
    renderErrorPage($errors, $entryUrl);
    exit;
  }

  renderConfirm($data, $fields, $uploads);
  exit;
}

$attachments = [];
foreach ($fileFields as $key => $label) {
  [$file, $error] = validateTempAttachment($key, $label, $tmpDir);
  if ($error) {
    $errors[] = $error;
  } else {
    $attachments[$key] = $file;
  }
}

if ($errors) {
  renderErrorPage($errors, $entryUrl);
  exit;
}

$subject = '【京浜電設 採用サイト】応募フォームより送信がありました';
$body = buildBody($data, $fields);

if (!sendMultipartMail($adminTo, $subject, $body, $fromAddress, $data['email'], $attachments)) {
  renderErrorPage(['送信に失敗しました。時間をおいて再度お試しください。'], $entryUrl);
  exit;
}

sendReceiptMail($data['email'], $fromAddress, $data, $fields);
$_SESSION['entry_last_send'] = time();
unset($_SESSION['entry_form_token']);
cleanTempFiles($attachments);
renderThanks();
