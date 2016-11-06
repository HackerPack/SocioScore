package com.hackerpack.socioscore_android;

import android.app.Activity;
import android.os.AsyncTask;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.WindowManager;
import android.widget.TextView;

import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

public class IncomingCallActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        try {
            // TODO Auto-generated method stub
            super.onCreate(savedInstanceState);

            getWindow().addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE);
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL);

            String phoneNumber = getIntent().getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
            HttpRequestTask httpRequestTask = new HttpRequestTask();
            httpRequestTask.execute(phoneNumber);
        } catch (Exception e) {
            Log.d("Exception", e.toString());
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private class HttpRequestTask extends AsyncTask<String, Void, Score> {
        @Override
        protected Score doInBackground(String... params) {
            String phoneNumber = params[0];
            Log.d("HttpRequestTask", phoneNumber);
            try {
                final String url = "http://10.126.79.76:3000/phone/"+phoneNumber;
                RestTemplate restTemplate = new RestTemplate();
                restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
                Score score = restTemplate.getForObject(url, Score.class);
                return score;
            } catch (Exception e) {
                Log.e("MainActivity", e.getMessage(), e);
            }

            return null;
        }

        @Override
        protected void onPostExecute(Score score) {

            setContentView(R.layout.main);

            TextView text = (TextView) findViewById(R.id.text);
            text.setText("Call From: " + score.getPhonenumber() +
                    "\n Caller name: " + score.getName() +
                    "\n SocioScore: " + score.getScore()
            );

//            TextView greetingIdText = (TextView) findViewById(R.id.id_value);
//            TextView greetingContentText = (TextView) findViewById(R.id.content_value);
//            greetingIdText.setText(score.getId());
//            greetingContentText.setText(score.getContent());
        }

    }
}