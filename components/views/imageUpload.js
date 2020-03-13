import React, { useState, useEffect } from "react";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import { SizedAspectRatioBox } from "../simple/aspectBox.js";
import classNames from "classnames";
import axios from "../../lib/axios.js";
import Util from "../../lib/util.js";
import UploadImages from "react-upload-gallery";

import "../../static/css/grid.css";

export const hvOffset = (width, height) => {
  let w = width > height ? (width * 100) / height : 100;
  let h = width > height ? 100 : (height * 100) / width;
  let hr, vr;
  if(h > 100) {
    hr = 0;
    vr = h - 100;
  } else if(w > 100) {
    hr = w - 100;
    vr = 0;
  }
  return { w, h, hr, vr };
};

export const ImageUpload = inject("rootStore")(
  observer(({ images, rootStore, onChoose, onDelete, onRotate, shiftState, ...props }) => {
    const [shift, setShift] = React.useState(false);
    shiftState.subscribe(newValue => {
      setShift(newValue);
      console.log("shiftState: ", newValue);
    });

    return (
      <div className={"upload-area"}>
        <UploadImages
          action="/api/image/upload" // upload route
          source={response => {
            return response.map(photo => {
              console.log("UploadImages response:", { photo, url });
              const { id } = photo;
              const url = `/api/image/get/${id}.jpg`;
              let entry = rootStore.newImage(photo);
              axios.head(url).then(res => {
                if(res.status == 200) {
                  const { width, height, aspect, channels, depth } = res.headers;
                  console.log("HEAD: ", res);
                  Object.assign(entry, { width, height, aspect, channels, depth, ...entry });
                }
              });
              return url;
            })[0];
          }}
          onSuccess={arg => {
            const id = parseInt(arg.source.replace(/.*\/([0-9]+).jpg/, "$1"));
            console.log("UploadImages success:", { id, arg });
            let entry = rootStore.newImage({ id });
            console.log("UploadImages success:", toJS(entry));
            // arg.remove();
          }}
        ></UploadImages>
        <div className={"rug"}>
          <div className={"rug-items __card __sorting" /*"image-list grid-col grid-gap-10"*/}>
            {images.map((image, index) => {
              let id = image.id;

              image = toJS(image);
              //console.log("image-list entry", {id,image});
              const { width, height } = image;
              const landscape = width > height;
              const orientation = landscape ? "landscape" : "portrait";

              let { w, h, hr, vr } = hvOffset(width, height);

              return (
                <div key={index}>
                  <div className={"rug-item"}>
                    <div className={"rug-card"}>
                      <SizedAspectRatioBox className={"item-box"} insideClassName={"tooltip"} sizeClassName={"rug-image"} insideProps={{ ["data-tooltip"]: `${width}x${height} ${orientation}` }}>
                        <img
                          id={`image-${id}`}
                          className={classNames(/*"inner-image", */ index == rootStore.state.selected && "selected")}
                          src={`/api/image/get/${id}.jpg`}
                          width={width}
                          height={height}
                          orientation={orientation}
                          style={{
                            position: "relative",
                            marginTop: `${-vr / 2}%`,
                            marginLeft: `${-hr / 2}%`,
                            width: landscape ? `${(width * 100) / height}%` : "100%",
                            height: landscape ? "100%" : "auto"
                          }}
                          onClick={onChoose}
                        />
                      </SizedAspectRatioBox>
                      <button className={"image-button image-delete center-flex"} onClick={() => onDelete(id)}>
                        <svg height="24" width="24" viewBox="0 0 16 16">
                          <defs />
                          <path fill={"#f00"} stroke={"#a00"} d="M11.004 3.982a1 1 0 00-.707.293L8.004 6.568 5.72 4.285a1 1 0 00-.01-.01 1 1 0 00-.701-.289L5 4a1 1 0 00-1 1 1 1 0 00.293.707L6.586 8l-2.293 2.293a1 1 0 00-.29.7 1 1 0 001 1 1 1 0 00.708-.294l2.293-2.293 2.283 2.283a1 1 0 00.717.303 1 1 0 001-1 1 1 0 00-.293-.707l-2.3-2.299 2.282-2.283a1 1 0 00.31-.72 1 1 0 00-1-1z" />
                        </svg>
                      </button>
                      <button className={"image-button image-rotate center-flex"} onClick={() => onRotate(id, shift ? -90 : 90)}>
                        <svg height="24" width="24" viewBox="0 0 16 16">
                          <defs />
                          <g transform={`translate(7.483179807662964, 0)`}>
                            <g transform={` scale(${shift ? -1 : 1}, 1)`}>
                              <g>
                                <path d=" m 4.509820430755616 10.754 a 5.059 5.059 0 0 1 -3.176 2.27 a 5.056 5.056 0 0 1 -3.84 -0.708 a 5.051 5.051 0 0 1 -2.105 -3.006 a 5.051 5.051 0 0 1 0.517 -3.634 h 0 a 4.969 4.969 0 0 1 2.939 -2.586 a 4.97 4.97 0 0 1 3.895 0.39 a 4.94 4.94 0 0 1 2.005 2.11" fill="none" stroke="#00f" strokeWidth="1.66983039" />
                                <path d="m 1.9508197154998772 5.852 l 4.516 2.14 l -0.405 -4.981 l -4.11 2.84 Z " fill="#00f" />
                              </g>
                            </g>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <style jsx global>{`
          .rug-item {
            cursor: -webkit-grab;
            cursor: grab;
          }
          .upload-area {
            position: relative;
            padding: 0px 10px;
            min-width: 80vmin;
          }
          div.upload-area > div > div,
          div.upload-area > div > div > div {
            position: relative;
            display: block;
          }
          .item-box {
            box-sizing: content-box;
            overflow: hidden;
          }
          .item-box-size {
            border: 1px solid black;
            box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.75);
            width: 100%;
            height: 100%;
          }
          .aspect-ratio-box {
            overflow: hidden;
          }
          .image-entry {
            position: relative;
          }
          .image-buttonlist {
          }
          .image-button {
            position: absolute;
            padding: 0;
            border: 1px outset #cdcdcd;
            border-radius: 99999px;
            background: #ffffff60;
            filter: drop-shadow(1px 1px 10px #ffffffff);
          }
          .image-button > img {
            position: relative;
            width: 24px;
            height: 24px;
          }
          .image-delete {
            top: 2px;
            right: 2px;
          }
          .image-rotate {
            top: 30px;
            right: 2px;
          }
          .image-delete:active > img {
            transform: translate(1px, 1px);
          }
          .image-delete:active {
            border: 1px inset #cdcdcd;
          }
          .image-delete:hover {
            background: #ffdc20c0;
          }
          .auth-fail {
            position: relative;
          }

          .rug-dragging-item > div:not(.rug-list) {
            transform: scale(1.1);
          }

          .rug {
            font-size: 14px;
            color: #000;
            min-width: 80vw;
          }

          .rug .rug-file-input {
            display: none !important;
          }

          .rug .rug-item {
            justify-content: center;
            user-select: none;
            cursor: default;
          }

          .rug .rug-items.__card {
            display: flex;
            flex-flow: row wrap;
            margin: 0 -10px;
          }

          .rug .rug-items.__card .rug-item {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .rug .rug-items.__list {
            padding-top: 30px;
            min-height: 220px;
          }

          .rug .rug-handle {
            width: 100%;
            height: 290px;
            overflow: hidden;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }

          .rug .rug-handle:before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: calc(100% - 8px);
            height: calc(100% - 8px);
            border: 4px solid #000;
          }

          .rug .rug-handle .rug-handle-info,
          .rug-card {
            position: relative;
          }

          .rug .rug-handle svg.rug-handle-icon {
            width: 70px;
          }

          .rug .rug-handle svg.rug-handle-icon line,
          .rug .rug-handle svg.rug-handle-icon polyline {
            fill: none;
            stroke: #000;
            stroke-linejoin: round;
            stroke-width: 2px;
            stroke-linecap: round;
          }

          .rug .rug-handle.__dragging:before {
            border: 4px dashed rgba(138, 0, 16, 0.8);
            background-color: rgba(0, 122, 255, 0.15);
          }

          .rug .rug-handle.__dragging svg line,
          .rug .rug-handle.__dragging svg polyline {
            stroke: rgba(138, 0, 16, 0.8);
          }

          .rug .rug-handle.__dragging .__arrow {
            animation: 1s up-arrow forwards infinite;
          }

          .rug .rug-handle .rug-handle-info .rug-handle-drop-text {
            font-size: 22px;
          }

          .rug .rug-handle .rug-handle-info .rug-handle-button {
            background-color: rgba(138, 0, 16, 0.8);
            padding: 7px 12px;
            font-size: 16px;
            color: #fff;
            text-align: center;
            max-width: 250px;
            display: block;
            margin: 0 auto;
          }

          .rug .rug-handle .rug-handle-info .rug-handle-button:hover {
            background-color: rgba(192, 8, 32, 0.8);
          }

          .rug .rug-handle .rug-handle-info span {
            text-align: center;
            padding: 10px 0;
            font-size: 17px;
            display: block;
          }

          .rug-card {
            flex: 1 1 20%;
            width: 18vw;
            background-color: #000;
            font-family: Fixed;
            overflow: auto;
            margin: 10px;
          }

          .rug-card.__error {
            border: 3px solid rgba(160, 0, 16, 1);
          }

          .rug-card .rug-card-image {
            width: 100%;
            padding-top: 100%;
            background-position: 50%;
            background-size: contain;
            background-repeat: no-repeat;
          }

          .rug-card .rug-card-name {
            position: absolute;
            z-index: 15;
            height: 100px;
            width: 100%;
            font-weight: 700;
            font-size: 12px;
            white-space: nowrap;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0, rgba(0, 0, 0, 0.7) 29%, transparent);
            background-blend-mode: multiply;
            color: #f5f5f5;
          }

          .rug-card .rug-card-progress,
          .rug-card .rug-card-progress-count,
          .rug-card .rug-card-refresh,
          .rug-card .rug-card-upload-button {
            top: calc(50% - 25px);
            left: calc(50% - 25px);
            width: 50px;
            height: 50px;
            position: absolute;
          }

          .rug-card .rug-card-name > div {
            margin: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rug-card .rug-card-size {
            color: #c3c3c3;
            font-size: 11px;
          }

          .rug-card .rug-card-progress {
            display: block;
          }

          .rug-card .rug-card-progress .__progress-cricle {
            stroke: rgba(138, 0, 16, 0.8);
            fill: none;
            stroke-width: 5;
            stroke-linecap: round;
            transition: stroke-dasharray 0.2s ease;
          }

          .rug-card .rug-card-progress-count {
            text-align: center;
            line-height: 50px;
            color: #fff;
            font-weight: 700;
          }

          .rug-card .rug-card-refresh {
            background-color: rgba(255, 255, 255, 0.7);
            z-index: 20;
            border: 2px solid transparent;
          }

          .rug-card .rug-card-refresh:hover {
            background-color: rgba(255, 255, 255, 0.9);
            border: 2px solid #000;
          }

          .rug-card .rug-card-refresh .__refresh-icon g {
            fill: #3d4852;
          }

          .rug-card .rug-card-refresh.__spin {
            animation: __spin 1s linear infinite;
            border: 2px solid rgba(138, 0, 16, 0.8) !important;
          }

          .rug-card .rug-card-refresh.__spin .__refresh-icon g {
            fill: rgba(138, 0, 16, 0.8);
          }

          .rug-card .rug-card-upload-button {
            background-color: rgba(255, 255, 255, 0.7);
            z-index: 20;
            text-align: center;
            border: 2px solid transparent;
          }

          .rug-card .rug-card-upload-button svg {
            width: 25px;
            margin-top: 6px;
          }

          .rug-card .rug-card-upload-button svg line,
          .rug-card .rug-card-upload-button svg polyline {
            fill: none;
            stroke: #000;
            stroke-linejoin: round;
            stroke-width: 3px;
            stroke-linecap: round;
          }

          .rug-card .rug-card-upload-button:hover {
            border: 2px solid rgba(138, 0, 16, 0.8);
            background-color: rgba(255, 255, 255, 0.9);
          }

          .rug-card .rug-card-upload-button:hover svg line,
          .rug-card .rug-card-upload-button:hover svg polyline {
            stroke: rgba(138, 0, 16, 0.8);
          }

          .rug-card .rug-card-upload-button:hover svg .__arrow {
            animation: 1s up-arrow forwards infinite;
          }

          .rug-card .rug-card-remove {
            position: absolute;
            z-index: 40;
            bottom: 0;
            right: 0;
            color: #fff;
            background-color: #000;
            opacity: 0.75;
            border-radius: 9999px;
            margin: 4px;
            padding: 4px;
            width: 22px;
            height: 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1.5px solid transparent;
            transition: border 0.2s ease;
          }

          .rug-card .rug-card-remove:hover {
            border: 1.5px solid #fff;
          }

          .rug-card .rug-card-remove svg {
            stroke: currentColor;
            height: 18px;
            width: 18px;
          }

          .rug-list {
            width: 100%;
            background-color: #000;
            border-radius: 3px;
            position: relative;
            font-family: Helvetica;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            margin-bottom: 10px;
          }

          .rug-list.__error {
            border: 3px solid rgba(160, 0, 16, 1);
          }

          .rug-list .rug-list-progress {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 5px;
            background: rgba(138, 0, 16, 0.8);
            border: 3px;
            opacity: 0;
            transition: all 0.2s ease;
          }

          .rug-list .rug-list-refresh,
          .rug-list .rug-list-upload-button {
            position: absolute;
            bottom: 5px;
            right: 5px;
            width: 25px;
            height: 25px;
            z-index: 20;
          }

          .rug-list .rug-list-progress.__active {
            opacity: 1;
          }

          .rug-list .rug-list-progress-count {
            position: absolute;
            bottom: 5px;
            right: 5px;
            color: #f5f5f5;
            font-size: 13px;
            opacity: 0;
            transition: all 0.2s ease;
          }

          .rug-list .rug-list-progress-count.__active {
            opacity: 1;
          }

          .rug-list .rug-list-refresh {
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.7);
            border: 2px solid transparent;
          }

          .rug-list .rug-list-refresh:hover {
            background-color: rgba(255, 255, 255, 0.9);
          }

          .rug-list .rug-list-refresh .__refresh-icon g {
            fill: #3d4852;
          }

          .rug-list .rug-list-refresh.__spin {
            animation: __spin 1s linear infinite;
          }

          .rug-list .rug-list-refresh.__spin .__refresh-icon g {
            fill: rgba(138, 0, 16, 0.8);
          }

          .rug-list .rug-list-upload-button {
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.7);
            text-align: center;
            border: 2px solid transparent;
          }

          .rug-list .rug-list-upload-button svg {
            width: 15px;
            margin-top: 2px;
          }

          .rug-list .rug-list-upload-button svg line,
          .rug-list .rug-list-upload-button svg polyline {
            fill: none;
            stroke: #000;
            stroke-linejoin: round;
            stroke-width: 3px;
            stroke-linecap: round;
          }

          .rug-list .rug-list-upload-button:hover {
            background-color: rgba(255, 255, 255, 0.9);
          }

          .rug-list .rug-list-upload-button:hover svg line,
          .rug-list .rug-list-upload-button:hover svg polyline {
            stroke: rgba(138, 0, 16, 0.8);
          }

          .rug-list .rug-list-upload-button:hover svg .__arrow {
            animation: 1s up-arrow forwards infinite;
          }

          .rug-list .rug-list-image {
            width: 100px;
            height: 70px;
            padding: 5px;
          }

          .rug-list .rug-list-image img {
            width: 100%;
            height: 100%;
          }

          .rug-list .rug-list-content {
            padding: 5px;
            width: calc(100% - 120px);
          }

          .rug-list .rug-list-content .rug-list-name {
            color: #f5f5f5;
            white-space: nowrap;
            font-size: 14px;
            text-overflow: ellipsis;
            position: relative;
            overflow: hidden;
            width: calc(100% - 40px);
          }

          .rug-list .rug-list-content .rug-list-size {
            color: #ddd;
            font-size: 12px;
            margin-top: 3px;
          }

          .rug-list .rug-list-remove {
            position: absolute;
            z-index: 40;
            top: 0;
            right: 0;
            color: #ccc;
            opacity: 0.75;
            border-radius: 9999px;
            padding: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .rug-list .rug-list-remove svg {
            stroke: currentColor;
            height: 22px;
            width: 22px;
          }

          .rug-list .rug-list-remove:hover {
            color: #fff;
          }
        `}</style>
      </div>
    );
  })
);

export default ImageUpload;
