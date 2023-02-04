# muffintube-api

MuffinTube mobile JS API

## Install

```bash
npm install muffintube-api
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`executeFFMPEG(...)`](#executeffmpeg)
* [`startYoutubeDownload(...)`](#startyoutubedownload)
* [`initializeYoutubeDl()`](#initializeyoutubedl)
* [`openFolderPicker()`](#openfolderpicker)
* [`readFileAsBase64(...)`](#readfileasbase64)
* [`writeFileFromBase64(...)`](#writefilefrombase64)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### executeFFMPEG(...)

```typescript
executeFFMPEG(options: { value: string; }) => Promise<void>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

--------------------


### startYoutubeDownload(...)

```typescript
startYoutubeDownload(options: { callbackId: string; videoUrl: string; saveLocation: string; }) => Promise<void>
```

| Param         | Type                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **`options`** | <code>{ callbackId: string; videoUrl: string; saveLocation: string; }</code> |

--------------------


### initializeYoutubeDl()

```typescript
initializeYoutubeDl() => Promise<boolean>
```

**Returns:** <code>Promise&lt;boolean&gt;</code>

--------------------


### openFolderPicker()

```typescript
openFolderPicker() => Promise<{ value: string; }>
```

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### readFileAsBase64(...)

```typescript
readFileAsBase64(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### writeFileFromBase64(...)

```typescript
writeFileFromBase64(options: { path: string; data: string; }) => Promise<void>
```

| Param         | Type                                         |
| ------------- | -------------------------------------------- |
| **`options`** | <code>{ path: string; data: string; }</code> |

--------------------

</docgen-api>
